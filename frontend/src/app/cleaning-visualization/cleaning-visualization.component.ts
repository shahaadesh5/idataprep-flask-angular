import {
  Component,
  OnInit,
  ViewChild,
  Renderer2,
  ElementRef
} from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import cleanColours from './colours';

@Component({
  selector: 'app-cleaning-visualization',
  templateUrl: './cleaning-visualization.component.html',
  styleUrls: ['./cleaning-visualization.component.scss']
})
export class CleaningVisualizationComponent implements OnInit {
  svg;
  mainGroup;
  root;
  tooltip;
  @ViewChild('cleaningVizRoot', { static: true }) cleaningVizRoot: ElementRef;
  @ViewChild('infoTooltip', { static: true }) infoTooltip: ElementRef;

  svgHeight = 800;
  svgWidth = 800;
  graphHeight = 800;
  graphWidth = 800;
  dataset = [];
  dirtyColours = ['#f30000', '#fb8c00', '#ffd600', '#f30000'];
  dirtyColourScale = d3
    .scaleOrdinal()
    .domain(['nan', 'neg', 'zero', 'dirtyCount'])
    .range(this.dirtyColours);

  cleanColours = cleanColours;
  cleanColourScale = d3.scaleOrdinal().range(this.cleanColours);

  dirtyScoreColourScale = d3
    .scaleLinear()
    .domain([0, 0.15, 1])
    .range(['green', '#fb8c00', 'red']);

  margin = { top: 10, bottom: 20, left: 0, right: 60 };
  innerWidth = this.graphWidth - this.margin.left - this.margin.right;
  innerHeight = this.graphHeight - this.margin.top - this.margin.bottom;

  chartPerLine = 2;

  constructor(private dataservice: DataService, private renderer: Renderer2) {}

  ngOnInit() {
    this.dataservice.cleaningStepDataUpdate.subscribe(stepData => {
      this.dataset.push(stepData);
      this.plotDonutChart(
        this.dataset[this.dataset.length - 1],
        this.mainGroup,
        this.getDonutXCoord(),
        this.getDonutYCoord()
      );
      this.svg.attr(
        'height',
        () => this.getDonutYCoord() + this.innerWidth / this.chartPerLine
      );
    });

    console.log(this.root);
    console.log(this.tooltip);
    this.root = this.cleaningVizRoot.nativeElement;
    this.tooltip = this.infoTooltip.nativeElement;
    console.log(this.root);
    console.log(this.tooltip);
    this.svg = this.renderer.createElement('svg', 'svg');
    this.renderer.setAttribute(this.svg, 'width', '200');
    this.renderer.setAttribute(this.svg, 'height', '0');
    this.renderer.appendChild(this.root, this.svg);

    this.svg = d3
      .select(this.svg)
      .attr('height', this.svgHeight)
      .attr('width', this.svgWidth);

    this.mainGroup = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

  }

  getDonutXCoord() {
    return (
      (this.innerWidth / this.chartPerLine) *
      ((this.dataset.length - 1) % this.chartPerLine)
    );
  }

  getDonutYCoord() {
    return (
      (this.innerWidth / this.chartPerLine) *
      Math.floor((this.dataset.length - 1) / this.chartPerLine)
    );
  }

  plotDonutChart(data, svg, x, y) {
    const _this = this;
    const padding = 30;
    const radius = this.innerWidth / this.chartPerLine / 2 - padding;

    let total = 0;
    let dirtyTotal = 0;
    data.arcCategories = [];

    if (data.type === 'numeric') {
      total = data.validCount;
      data.arcCategories.push([
        'Valid',
        data.validCount,
        'clean',
        this.cleanColourScale(0)
      ]);

      for (const key in data.dirtyStats) {
        // skip loop if the property is from prototype
        if (!data.dirtyStats.hasOwnProperty(key)) {
          continue;
        }
        dirtyTotal += data.dirtyStats[key];
        data.arcCategories.push([
          key,
          data.dirtyStats[key],
          'dirty',
          this.dirtyColourScale(key)
        ]);
      }
      total += dirtyTotal;
    } else {
      dirtyTotal = data.dirtyCount;
      let i = 0;
      for (const key in data.categoryStats) {
        // skip loop if the property is from prototype
        if (!data.categoryStats.hasOwnProperty(key)) {
          continue;
        }
        total += data.categoryStats[key];
        data.arcCategories.push([
          key,
          data.categoryStats[key],
          'clean',
          this.cleanColourScale(i++)
        ]);
      }
      data.arcCategories.push([
        'Invalid',
        dirtyTotal,
        'dirty',
        this.dirtyColourScale('dirtyCount')
      ]);
      total += dirtyTotal;
    }

    const onMouseOverArc = function(d, i) {
      d3.select(this)
        .selectAll('.categoryLabel')
        .transition(`catLabelOpacityToggle-${i}`)
        .ease(d3.easeLinear)
        .duration(500)
        .style('opacity', '1');
    };

    const onMouseLeaveArc = function(d, i) {
      d3.select(this)
        .selectAll('.categoryLabel')
        .transition(`catLabelOpacityToggle-${i}`)
        .ease(d3.easeLinear)
        .duration(50)
        .style('opacity', '0');
    };

    const onMouseOverChart = function(d, i) {
      d3.selectAll('.chart').style('opacity', '.3');
      d3.select(this).style('opacity', '1');
    };

    const onMouseLeaveChart = function(d, i) {
      d3.selectAll('.chart')
        .transition(`chartOpacityToggle-${i}-0`)
        .ease(d3.easeLinear)
        .duration(50)
        .style('opacity', '1');
    };

    const dirtyScore = dirtyTotal / total;

    console.log('total: ' + total);
    console.log('dirtyTotal: ' + dirtyTotal);
    console.log(data.arcCategories);

    // create arc generator
    const dirtyArc = d3
      .arc()
      .outerRadius(radius)
      .innerRadius(radius - 30);

    const cleanArc = d3
      .arc()
      .outerRadius(radius - 30)
      .innerRadius(radius - 60);

    const cleanLabelArc = d3
      .arc()
      .outerRadius(radius - 45)
      .innerRadius(radius - 45);

    const dirtyLabelArc = d3
      .arc()
      .outerRadius(radius)
      .innerRadius(radius);

    const arcs = d3.pie()(data.arcCategories.map(elem => elem[1]));
    console.log(arcs);

    const g = svg
      .append('g')
      .attr(
        'transform',
        `translate(${radius + padding + x}, ${radius + padding + y})`
      )
      .on('mouseover', onMouseOverChart)
      .on('mouseleave', onMouseLeaveChart)
      .classed('chart', true);
    g.append('circle')
      .attr('r', radius)
      .style('fill', 'rgb(250, 250, 255)');

    const arcsGroup = g
      .selectAll('.arc')
      .data(arcs)
      .enter()
      .append('g')
      .classed('arc', true)
      .on('mouseover', onMouseOverArc)
      .on('mouseleave', onMouseLeaveArc);

    arcsGroup
      .append('path')
      .style('fill', 'white')
      .transition(() => `transition-${data.name}`)
      .ease(d3.easeCubic)
      .duration(1000)
      .attr('d', (d, i) => {
        return data.arcCategories[i][2] === 'clean' ? cleanArc(d) : dirtyArc(d);
      })
      .style('fill', (d, i) => data.arcCategories[i][3])
      .style('opacity', '.9');

    const categoryLabels = arcsGroup
      .append('g')
      .attr(
        'transform',
        (d, i) =>
          `translate(${-(28 + `${data.arcCategories[i][0]} - (${Math.round(d.data / total * 1000) / 10}%)`.length * 10) / 2},${-190})`
      )
      .attr('class', (d, i) => `categoryLabel categoryLabel-${i}`)
      .attr('text-anchor', 'middle')
      .style('opacity', '0');

    categoryLabels
      .append('rect')
      .style('stroke', 'skyblue')
      .style('stroke-width', 1)
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 15)
      .attr('ry', 15)
      .attr('width', (d, i) => 28 + `${data.arcCategories[i][0]} - (${Math.round(d.data / total * 1000) / 10}%)`.length * 10)
      .attr('height', 25)
      .style('fill', 'white')
      .style('opacity', '.8');

    categoryLabels
      .append('circle')
      .style('fill', (d, i) => data.arcCategories[i][3])
      .style('stroke-width', 1)
      .attr('cx', 10)
      .attr('cy', 13)
      .attr('r', 5);

    categoryLabels
      .append('text')
      .attr('x', 18)
      .attr('y', 3)
      .text((d, i) => `${data.arcCategories[i][0]} - (${Math.round(d.data / total * 1000) / 10}%)`)
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'hanging')
      .classed('category-label', true)
      .style('fill', 'black');

    g.append('text')
      .attr('transform', `translate(${0}, ${-20})`)
      .text(data.name.toUpperCase())
      .attr('class', (d, i) => `featureLabel featureLabel-${i}`)
      .attr('text-anchor', 'middle')
      .style('fill', 'black')
      .style('font-weight', '500');

    g.append('text')
      .attr('transform', `translate(${0}, ${25})`)
      .text(`${Math.round(dirtyScore * 100)}%`)
      .attr('class', (d, i) => `featureLabel featureLabel-${i}`)
      .attr('text-anchor', 'middle')
      .style('fill', () => this.dirtyScoreColourScale(dirtyScore))
      .style('font-size', '3.5em')
      .style('font-weight', '300');

    return g;
  }
}
