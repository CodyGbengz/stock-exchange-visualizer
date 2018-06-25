import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NouisliderModule } from 'ng2-nouislider';


import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import stockExchangeData from './data-sample.json';

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private companyList = ['AMGN', 'FB', 'GOOGL', 'MSFT'];
  private margin = { top: 0, right: 20, bottom: 30, left: 70 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  private companyName: String;
  private companyData: Array<any>;
  private range = [0, 5000];
  private start=[0, 10];

  constructor() {
    this.width = 1000 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

  }

  ngOnInit() {
    // randomly select a company from a list and fetch its data
    this.companyName = this.companyList[Math.floor(Math.random() * this.companyList.length)]
    this.setCompanyData(this.companyName);    
  }

  private setCompanyName() {
    this.setCompanyData(this.companyName)
  }

  private zoom(values) {
    // get range values from slider
    this.range[0] = Math.round(values[0]);
    this.range[1] = Math.round(values[1]);
    this.setCompanyData(this.companyName);
  }

  private setCompanyData(Name: any) {
    this.companyData = stockExchangeData.filter(dailyEntries => dailyEntries.ticker === Name).slice(this.range[0],this.range[1]);
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawChart();
  }


  private initSvg() {
    d3.select('svg').remove(); 
    this.svg =  d3.select('.candlestick').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.companyData, (d: any) => new Date(d.date)));
    this.y.domain([d3Array.min(this.companyData, (d: any) => +d.low),
    d3Array.max(this.companyData, (d: any) => +d.high)]);
  }

  private drawAxis() {
    this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));

    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('price');
  }

  private drawChart() {
    // draw candle
    this.svg.append('g').selectAll('rect')
      .data(this.companyData)
      .enter().append('rect')
      .attr('x', (d => this.x(new Date(d.date))))
      .attr('y', (d => this.y(Math.max(d.open, d.close))))
      .attr('height', (d => (this.y(Math.min(d.open, d.close)) - this.y(Math.max(d.open, d.close)))))
      .attr('width', (d => 0.5 * (this.width - 2 * this.margin.left + this.margin.right) / this.companyData.length))
      .attr('fill', d => d.open > d.close ? 'red' : 'green')

    // draw wicks
    this.svg.append('g').selectAll('line.stem')
      .data(this.companyData)
      .enter().append('svg:line')
      .attr('class', 'stem')
      .attr('x1', (d => this.x(new Date(d.date)) + 0.25 * (this.width - 2 * this.margin.left + this.margin.right) / this.companyData.length))
      .attr('x2', (d => this.x(new Date(d.date)) + 0.25 * (this.width - 2 * this.margin.left + this.margin.right) / this.companyData.length))
      .attr('y1', (d => this.y(d.high)))
      .attr('y2', (d => this.y(d.low)))
      .attr('stroke', (d => d.open > d.close ? 'red' : 'green'))
      
  }

}

