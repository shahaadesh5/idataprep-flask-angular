import {
  Component,
  OnInit,
  ViewChild,
  Renderer2,
  ElementRef,
  Output,
  EventEmitter
} from '@angular/core';
import { DataService } from '../data.service';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

@Component({
  selector: 'app-algorithms-suggestion',
  templateUrl: './algorithms-suggestion.component.html',
  styleUrls: ['./algorithms-suggestion.component.scss']
})
export class AlgorithmsSuggestionComponent implements OnInit {
  ready = false;
  done = false;
  svg;
  chartViz;
  dataRanking = [];
  sortedRanking = [];
  algo;
  @Output() completed = new EventEmitter<boolean>();

  @ViewChild('accuracygraph', { static: true }) accuracyGraph: ElementRef;

  svgHeight = 800;
  svgWidth = 800;
  graphHeight = 800;
  graphWidth = 800;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };

  constructor(private dataservice: DataService, private renderer: Renderer2) {}

  ngOnInit() {
    this.chartViz = this.accuracyGraph.nativeElement;
    console.log('ChartViz=', this.chartViz);
    this.dataservice.algorithmAccuracy.subscribe(accurayData => {
      this.ready = true;
      console.log('Accuracies:', accurayData);
      this.dataRanking = accurayData;

      this.sortedRanking = this.dataRanking.sort(this.highToLow);
      console.log(this.sortedRanking);
      this.algo = this.sortedRanking[0];
      console.log(this.algo);

      this.svg = d3
        .select(this.chartViz)
        .append('svg')
        .attr('width', this.chartViz.offsetWidth)
        .attr('height', this.chartViz.offsetHeight + 100);
      const contentWidth =
        this.chartViz.offsetWidth - this.margin.left - this.margin.right;
      const contentHeight =
        this.chartViz.offsetHeight - this.margin.top - this.margin.bottom;
      const x = d3
        .scaleBand()
        .rangeRound([0, contentWidth - 50])
        .padding(0.3)
        .domain(this.dataRanking.map(d => d.algo));
      const y = d3
        .scaleLinear()
        .rangeRound([contentHeight, 0])
        .domain([0, d3.max(this.dataRanking, d => d.efficiency)]);

      const g = this.svg
        .append('g')
        .attr(
          'transform',
          'translate(' + this.margin.left + ',' + this.margin.top + ')'
        );

      const tip = d3Tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(d => {
          return (
            '<strong>Accuracy:</strong> <span style=\'color:red\'>' +
            d.efficiency * 100 +
            '%</span>'
          );
        });

      this.svg.call(tip);

      g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + contentHeight + ')')
        .call(d3.axisBottom(x));

      g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y).ticks(10, '%'))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('Efficiency');

      g.selectAll('.bar')
        .data(this.dataRanking)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('fill', '#df031d')
        .attr('x', d => x(d.algo))
        .attr('y', d => y(d.efficiency))
        .attr('width', x.bandwidth())
        .attr('height', d => contentHeight - y(d.efficiency))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

      this.completed.emit(true);
    });
  }

  highToLow(a: any, b: any) {
    if (a.efficiency < b.efficiency) {
      return 1;
    } else if (a.efficiency === b.efficiency) {
      return 0;
    } else {
      return -1;
    }
  }
}
