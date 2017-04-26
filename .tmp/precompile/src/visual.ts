/*
 *  Dot Plot by OKViz
 *
 *  Copyright (c) SQLBI. OKViz is a trademark of SQLBI Corp.
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import tooltip = powerbi.extensibility.utils.tooltip;
import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;

module powerbi.extensibility.visual.PBI_CV_175CB170_A56D_41C1_BA65_C17F395ADAE7  {

    interface VisualMeta {
        name: string;
        version: string;
        dev: boolean;
    }

    interface VisualViewModel {
        dataPoints: VisualDataPoint[];
        legendDataPoints: LegendDataPoint[];
        showLegend: boolean;
        domain: VisualDomain;
        settings: VisualSettings;
    }

    interface VisualDataPoint extends SelectableDataPoint {
        category?: any;
        value: number;      
        color?: string;
        format?: string;

        tooltips?: VisualTooltipDataItem[];
    }

    interface VisualDomain {
        start?: number;
        end?: number;
        startForced: boolean;
        endForced: boolean;
    }

    interface VisualSettings {
        dataPoint: {
            fillShapes: boolean;
            defaultFill: Fill;
            showAll: boolean;
        };
        dataLabels : {
            show: boolean;
            fontSize: number;
            fill: Fill;
            unit?: number; 
            precision?: number; 
        };
        xAxis : {
            show: boolean;
            gridline: boolean;
            type: string,
            fill: Fill;
        };
        yAxis : {
            show: boolean;
            start?: number,
            end?: number,
            fill: Fill;
            unit?: number;
            precision?: number; 
        };
        legend: {
            show: boolean;
            position: string;
            showTitle: boolean;
            titleText: string;
            labelColor: Fill;
            fontSize: number;
        };

        colorBlind?: {
            vision?: string;
        }
    }

    function defaultSettings(): VisualSettings {

        return {
            dataPoint: {
                fillShapes: true,
                defaultFill: {solid: { color: "#01B8AA" } },
                showAll: false
            },
           dataLabels: {
               show: false,
               fill: {solid: { color: "#777" } },
               fontSize: 9,
               unit: 0
           },
           xAxis: {
                show: true,
                gridline: true,
                type: "continuous",
                fill: {solid: { color: "#777" } }
           },
           yAxis: {
               show: true,
               fill: {solid: { color: "#777" } },
               unit: 0
            },
            legend: {
                show: false,
                position: 'Top',
                showTitle: false,
                titleText: '',
                labelColor: {solid: { color: "#666" } },
                fontSize: 8
            },

            colorBlind: {
                vision: "Normal"
            }
        };
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): VisualViewModel {

        //Get DataViews
        let dataViews = options.dataViews;
        let hasDataViews = (dataViews && dataViews[0]);
        let hasCategoricalData = (hasDataViews && dataViews[0].categorical && dataViews[0].categorical.values);
        let hasSettings = (hasDataViews && dataViews[0].metadata && dataViews[0].metadata.objects);

        //Get Settings
        let settings: VisualSettings = defaultSettings();
        if (hasSettings) {
            let objects = dataViews[0].metadata.objects;
            settings = {
                dataPoint: {
                    fillShapes: getValue<boolean>(objects, "dataPoint", "fillShapes", settings.dataPoint.fillShapes),
                    defaultFill: getValue<Fill>(objects, "dataPoint", "defaultFill", settings.dataPoint.defaultFill),
                    showAll: getValue<boolean>(objects, "dataPoint", "showAll", settings.dataPoint.showAll),
                },
                dataLabels: {
                    show: getValue<boolean>(objects, "dataLabels", "show", settings.dataLabels.show),
                    fontSize: getValue<number>(objects, "dataLabels", "fontSize", settings.dataLabels.fontSize),
                    fill: getValue<Fill>(objects, "dataLabels", "fill", settings.dataLabels.fill),
                    unit: getValue<number>(objects, "dataLabels", "unit", settings.dataLabels.unit),
                    precision: getValue<number>(objects, "dataLabels", "precision", settings.dataLabels.precision)
                },
                xAxis: {
                    show: getValue<boolean>(objects, "xAxis", "show", settings.xAxis.show),
                    gridline: getValue<boolean>(objects, "xAxis", "gridline", settings.xAxis.gridline),
                    type: getValue<string>(objects, "xAxis", "type", settings.xAxis.type),
                    fill: getValue<Fill>(objects, "xAxis", "fill", settings.xAxis.fill)
                },
                yAxis: {
                    show: getValue<boolean>(objects, "yAxis", "show", settings.yAxis.show),
                    start: getValue<number>(objects, "yAxis", "start", settings.yAxis.start),
                    end: getValue<number>(objects, "yAxis", "end", settings.yAxis.end),
                    fill: getValue<Fill>(objects, "yAxis", "fill", settings.yAxis.fill),
                    unit: getValue<number>(objects, "yAxis", "unit", settings.yAxis.unit),
                    precision: getValue<number>(objects, "yAxis", "precision", settings.yAxis.precision)
                },
                legend: {
                    show: getValue<boolean>(objects, "legend", "show", settings.legend.show),
                    position: getValue<string>(objects, "legend", "position", settings.legend.position),
                    showTitle: getValue<boolean>(objects, "legend", "showTitle", settings.legend.showTitle),
                    titleText: getValue<string>(objects, "legend", "titleText", settings.legend.titleText),
                    labelColor: getValue<Fill>(objects, "legend", "labelColor", settings.legend.labelColor),
                    fontSize: getValue<number>(objects, "legend", "fontSize", settings.legend.fontSize)
                },

                colorBlind: {
                     vision: getValue<string>(objects, "colorBlind", "vision", settings.colorBlind.vision),
                }
            }

            //Limit some properties
            if (settings.dataLabels.precision < 0) settings.dataLabels.precision = 0;
            if (settings.dataLabels.precision > 5) settings.dataLabels.precision = 5;
            if (settings.yAxis.precision < 0) settings.yAxis.precision = 0;
            if (settings.yAxis.precision > 5) settings.yAxis.precision = 5;
        }

        //Get DataPoints
        let domain: VisualDomain = { startForced: false, endForced: false };
        if (settings.yAxis.start !== undefined) {
            domain.start = settings.yAxis.start;
            domain.startForced = true;
        }
        if (settings.yAxis.end !== undefined) {
            domain.end = settings.yAxis.end;
            domain.endForced = true;
        }

        let dataPoints: VisualDataPoint[] = [];
        let legendDataPoints: LegendDataPoint[] = [];

        let tmpLegendValues = [];
        let showLegend = false;
        let dateFormat = d3.time.format('%x');

        if (hasCategoricalData) {
            let dataCategorical = dataViews[0].categorical;
            let category = (dataCategorical.categories ? dataCategorical.categories[0] : null);
            let categories = (category ? category.values : ['']);
            let group = dataCategorical.values.grouped();

            for (let i = 0; i < categories.length; i++) {

                let categoryValue = OKVizUtility.makeMeasureReadable(categories[i]);
                
                for (let ii = 0; ii < dataCategorical.values.length; ii++) {

                    let dataValue = dataCategorical.values[ii];
                    if (dataValue.source.roles['values']){

                        let tooltips = [];
                        let value: any = dataValue.values[i];
                        if (value !== null) {
                            if (!domain.startForced) 
                                domain.start = (domain.start !== undefined ? Math.min(domain.start, value) : value);

                            if (!domain.endForced)
                                domain.end = (domain.end !== undefined ? Math.max(domain.end, value) : value);

                            let identity; 
                            let format: string = dataValue.source.format;
                            let legendValue: any; 

                            let color = settings.dataPoint.defaultFill.solid.color;

                            if (dataValue.source.groupName) {
                                identity = host.createSelectionIdBuilder().withSeries(dataCategorical.values, dataValue).createSelectionId();

                                showLegend = true;
                                legendValue = OKVizUtility.makeMeasureReadable(dataValue.source.groupName);
                                
                                 let defaultColor: Fill = { solid: { color: host.colorPalette.getColor(legendValue).value } };

                                color = getValue<Fill>(group[ii].objects, 'dataPoint', 'fill', defaultColor).solid.color;
                         

                            } else if (dataCategorical.values.length > 1 || !category) {
                                identity = host.createSelectionIdBuilder().withMeasure(dataValue.source.queryName).createSelectionId();

                                showLegend = true;
                                legendValue = dataValue.source.displayName;
                             
                                 let defaultColor: Fill = { solid: { color: host.colorPalette.getColor(legendValue).value } };

                                 color = getValue<Fill>(dataValue.source.objects, 'dataPoint', 'fill', defaultColor).solid.color;
                

                            } else if (category) {

                                identity = host.createSelectionIdBuilder().withCategory(category, i).createSelectionId();

                                showLegend = false;
                                legendValue = categoryValue;

                                if (settings.dataPoint.showAll)
                                    color = getCategoricalObjectValue<Fill>(category, i, 'dataPoint', 'fill', settings.dataPoint.defaultFill).solid.color;
                            }

                            if (category) {
                                tooltips.push(<VisualTooltipDataItem>{
                                    displayName: (category.source.displayName || "Axis"),
                                    color: '#333',
                                    value: categoryValue
                                });
                            }
                            if (dataValue.source.groupName) {
                                tooltips.push(<VisualTooltipDataItem>{
                                    displayName: "Legend",
                                    color: '#333',
                                    value: OKVizUtility.makeMeasureReadable(dataValue.source.groupName)
                                });
                            }

                            let formattedValue = OKVizUtility.Formatter.format(value, {
                                format: dataValue.source.format,
                                formatSingleValues: true,
                                allowFormatBeautification: false
                            });
                            
                            tooltips.push(<VisualTooltipDataItem>{
                                displayName: dataValue.source.displayName,
                                color: color,
                                value: formattedValue
                            });

                            dataPoints.push(<VisualDataPoint>{
                                format: format, 
                                color: color,
                                category: categoryValue,
                                value: value,
                                identity: identity,
                                tooltips: tooltips
                            });

                            if (tmpLegendValues.indexOf(legendValue) === -1) {
                                tmpLegendValues.push(legendValue);

                                legendDataPoints.push(<LegendDataPoint>{
                                    label: legendValue,
                                    color: color,
                                    identity: identity
                                });
                            }
                        }
                    }

                }

            }

        }

        if (!domain.start) domain.start = 0;
        if (!domain.end) domain.end = 0;
        if (domain.start > domain.end) 
            domain.end = domain.start;

        return {
            dataPoints: dataPoints,
            legendDataPoints: legendDataPoints,
            showLegend:showLegend,
            domain: domain,
            settings: settings,
        };
    }

    export class Visual implements IVisual {
        private meta: VisualMeta;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private selectionIdBuilder: ISelectionIdBuilder;
        private tooltipServiceWrapper: tooltip.ITooltipServiceWrapper;
        private model: VisualViewModel;
        private interactivityService: IInteractivityService;
        private behavior: VisualBehavior;
        private legend: ILegend;

        private element: d3.Selection<HTMLElement>;

        constructor(options: VisualConstructorOptions) {

            this.meta = {
                name: 'Dot Plot',
                version: '1.0.0',
                dev: false
            };
            console.log('%c' + this.meta.name + ' by OKViz ' + this.meta.version + (this.meta.dev ? ' (BETA)' : ''), 'font-weight:bold');

            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(options.host.tooltipService, options.element);
            this.model = { dataPoints: [], legendDataPoints: [], showLegend: false, domain: {startForced: false, endForced: false}, settings: <VisualSettings>{} };

            this.element = d3.select(options.element);

            this.interactivityService = InteractivityModule.createInteractivityService(options.host);
            this.behavior = new VisualBehavior();

            this.legend = LegendModule.createLegend($(options.element), false, this.interactivityService, true, LegendPosition.Top);
        }
        
        public update(options: VisualUpdateOptions) {

            this.model = visualTransform(options, this.host);
            this.element.selectAll('div, svg:not(.legend)').remove();
            if (this.model.dataPoints.length == 0) return;

            let selectionManager  = this.selectionManager;

            let categories = [];
            for(let i = 0; i < this.model.dataPoints.length; i++) {
	            if (categories.indexOf(this.model.dataPoints[i].category) === -1) 
  	                categories.push(this.model.dataPoints[i].category);
            }
            if (categories.length == 0) categories.push('');

            let margin = {top: 6, left: 6, bottom: 0, right: 6};
            
            let xAxisHeight = 0;

            let yAxisWidth = 0;
            let yFormatter;
            if (this.model.settings.yAxis.show) {
                
                yFormatter = OKVizUtility.Formatter.getFormatter({
                    format: this.model.dataPoints[0].format,
                    value: this.model.settings.yAxis.unit,
                    formatSingleValues: (this.model.settings.yAxis.unit == 0),
                    precision: this.model.settings.yAxis.precision,
                    displayUnitSystemType: 0
                });

                yAxisWidth = TextUtility.measureTextWidth({
                    fontSize: '11px',
                    fontFamily: 'sans-serif',
                    text: yFormatter.format(this.model.domain.end)
                });
            }

            //Legend
            if (this.model.settings.legend.show && this.model.legendDataPoints.length > 0) {
        
                this.legend.changeOrientation(<any>LegendPosition[this.model.settings.legend.position]);
                this.legend.drawLegend(<LegendData>{
                    title: this.model.settings.legend.titleText,
                    dataPoints: this.model.legendDataPoints,
                    labelColor: this.model.settings.legend.labelColor.solid.color,
                    fontSize: this.model.settings.legend.fontSize
                }, options.viewport);

                appendLegendMargins(this.legend, margin);
  
            } else {

                this.legend.drawLegend({ dataPoints: [] }, options.viewport);
            }

            let pointMargin = 5;
            let axisPadding = 10;
            
            let scrollbarMargin = 25;

            
            let containerSize = {
                width: options.viewport.width - margin.left - margin.right,
                height: options.viewport.height - margin.top - margin.bottom
            };

            let ray = Math.max(1.5, Math.min(6, (containerSize.width / categories.length / 6)));
            let axisMargin = (containerSize.width * 0.05);

            let container =  this.element
                .append('div')
                .classed('chart', true)
                .style({
                    'width' :  containerSize.width + 'px',
                    'height':  containerSize.height + 'px',
                    'overflow-x': 'auto',
                    'overflow-y': 'hidden',
                    'margin-top': margin.top + 'px',
                    'margin-left': margin.left + 'px'
                });
            
            let slotWidth = Math.max(containerSize.width / categories.length, 15 + (pointMargin * 2));



            let plotSize = {
                width: Math.max(slotWidth * categories.length, containerSize.width),
                height: Math.max(80, containerSize.height)
            };


            let svgContainer = container
                .append('svg')
                .attr({
                    'width':  plotSize.width,
                    'height': plotSize.height - scrollbarMargin
                });

                let categoryIsDate = (Object.prototype.toString.call(categories[0]) === '[object Date]');
                
            //X
            let xRange = [yAxisWidth + axisPadding + axisMargin, plotSize.width - axisMargin];
            let x;
            let xFormatter;
            let xIsCategorical = (this.model.settings.xAxis.type === 'categorical');
            if (categoryIsDate) {

                let dateRange = d3.extent(categories); //this.model.dataPoints, function (d) { return d.category; });
                xFormatter = OKVizUtility.Formatter.getAxisDatesFormatter(dateRange[0], dateRange[1]);

                x = d3.time.scale().range(xRange)
                    .domain(dateRange);
            } else {
                if (categoryIsDate)
                    xFormatter = d3.time.format('%x');

                x = d3.scale.ordinal().rangePoints(<any>xRange)
                    .domain(categories); //this.model.dataPoints.map(function (d) { return d.category; }))
            
            }

                if (this.model.settings.xAxis.show) {
                
                let numTicks = (this.model.settings.xAxis.type == 'categorical' || !categoryIsDate ? categories.length :  (categoryIsDate ? 4 : Math.max(Math.floor((plotSize.width) / 80), 2)));

                let xAxis = d3.svg.axis().ticks(numTicks).outerTickSize(0).orient('bottom');
                if (xFormatter) xAxis.tickFormat(xFormatter);


                let svgAxisContainer = svgContainer
                    .append('svg')
                    .attr('width', plotSize.width);

                let axis = svgAxisContainer.selectAll("g.axis").data([0]);

                axis.enter().append("g").attr("class", "x axis");

                axis.call(xAxis.scale(x));
                //axis.selectAll('line').style('stroke', this.model.settings.xAxis.fill.solid.color);
                let labels = axis.selectAll('text')
                    .style('fill', this.model.settings.xAxis.fill.solid.color);


                let computedNumTicks = axis.selectAll('text').size();
                let tickMaxWidth = ((xRange[1] - xRange[0]) / computedNumTicks);

                if (tickMaxWidth < 20) {
                    labels.attr("transform", "rotate(-90)").attr('dy', '-0.5em').style("text-anchor", "end")
                    .call(TextUtility.truncateAxis, plotSize.height * 0.3);

                } else if (tickMaxWidth < 45) {
                    labels.attr("transform", function(d) {
                        return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-35)";
                    }).attr('dy', '0').attr('dx', '2.5em').style("text-anchor", "end")
                    .call(TextUtility.truncateAxis, plotSize.height * 0.3);
                
                } else {
                    labels.call(TextUtility.wrapAxis, tickMaxWidth);
                }


                let n = <any>axis.node();
                xAxisHeight = n.getBBox().height;
        
                axis.attr('transform', 'translate(0,' + (plotSize.height - scrollbarMargin - 5 - xAxisHeight)  + ')');

                if (this.model.settings.xAxis.gridline) {
                    let xGrid = d3.svg.axis().ticks(numTicks).tickSize(plotSize.height - scrollbarMargin - 5 - xAxisHeight - axisPadding, 0);
                    let grid = svgAxisContainer.selectAll("g.grid").data([0]);
                    grid.enter().append("g").attr("class", "x grid");
                    grid.call(xGrid.scale(x));
                    grid.selectAll('text').remove();
                }

            }

                //Y
            let yRange = [axisPadding + pointMargin,  plotSize.height - axisPadding - scrollbarMargin - 5 - xAxisHeight];
            let y = d3.scale.linear()
                .domain([this.model.domain.end, this.model.domain.start]) 
                .range(yRange).nice().nice();   
            
            
    
            if (this.model.settings.yAxis.show) {

                let yAxis = d3.svg.axis().tickPadding(axisPadding).innerTickSize(plotSize.width - yAxisWidth - axisPadding).ticks(Math.max(Math.floor(plotSize.height / 80), 2)).orient("left");
                if (yFormatter) yAxis.tickFormat(function (d) { return yFormatter.format(d); });

                let svgAxisContainer = svgContainer
                    .append('svg')
                    .attr('width', plotSize.width );

                let axis = svgAxisContainer.selectAll("g.axis").data([0]);
                axis.enter().append("g")
                    .attr("class", "y axis")
                    .attr('transform', 'translate(' + plotSize.width + ',0)');


                axis.call(yAxis.scale(y));
                //axis.selectAll('line').style('stroke', this.model.settings.yAxis.fill.solid.color);
                axis.selectAll('text').style('fill', this.model.settings.yAxis.fill.solid.color);

            }


            for (let i = 0; i < this.model.dataPoints.length; i++) {
                let dataPoint = this.model.dataPoints[i];

                if (dataPoint.value >= this.model.domain.start && dataPoint.value <= this.model.domain.end) {

                    svgContainer.append('circle')
                        .classed('point', true)
                        .data([dataPoint])
                        .attr('cx', x(dataPoint.category))
                        .attr('cy', y(dataPoint.value))
                        .attr('r', ray)
                        .attr('fill', (this.model.settings.dataPoint.fillShapes ? dataPoint.color : 'none'))
                        .attr('stroke', (this.model.settings.dataPoint.fillShapes ? 'none' : dataPoint.color));
                        /*.on('click', function(d) {
                            selectionManager.select(dataPoint.selectionId).then((ids: ISelectionId[]) => {
                                
                                d3.selectAll('.point').attr({
                                    'fill-opacity': (ids.length > 0 ? 0.3 : 1)
                                });

                                d3.select(this).attr({
                                    'fill-opacity': 1
                                });
                            });

                            (<Event>d3.event).stopPropagation();
                        });*/
                    
                    if (this.model.settings.dataLabels.show) {

                        let formattedValue = OKVizUtility.Formatter.format(dataPoint.value, {
                            format: dataPoint.format,
                            formatSingleValues: (this.model.settings.dataLabels.unit == 0),
                            value: this.model.settings.dataLabels.unit,
                            precision: this.model.settings.dataLabels.precision,
                            displayUnitSystemType: 2,
                            allowFormatBeautification: false
                        }); 
                        let fontSize = PixelConverter.fromPoint(this.model.settings.dataLabels.fontSize);
                        
                        svgContainer.append('text')
                            .classed('dataLabel', true)
                            .text(formattedValue)
                            .attr('x', x(dataPoint.category))
                            .attr('y', y(dataPoint.value) - ray - 5)
                            .attr('dominant-baseline', 'middle')
                            .style('font-size', fontSize)
                            .attr('text-anchor', 'middle')
                            .attr('fill', this.model.settings.dataLabels.fill.solid.color);

                    }
                }
            }

            
                if (this.interactivityService) {
                    this.interactivityService.applySelectionStateToData(this.model.dataPoints);

                    let behaviorOptions = {
                        selection: d3.selectAll('.point'),
                        clearCatcher: this.element,
                        hasHighlights: this.interactivityService.hasSelection() 
                    };

                    this.interactivityService.bind(this.model.dataPoints, this.behavior, behaviorOptions);
                }
                

             //Tooltips
            this.tooltipServiceWrapper.addTooltip(svgContainer.selectAll('.point'), 
                function(tooltipEvent: TooltipEventArgs<number>){
                    let dataPoint: VisualDataPoint = <any>tooltipEvent.data;
                    if (dataPoint && dataPoint.tooltips)
                        return dataPoint.tooltips;
                    
                    return null;
                }, 
                (tooltipEvent: TooltipEventArgs<number>) => null
            );

            OKVizUtility.t([this.meta.name, this.meta.version], this.element, options, this.host, {
                'cd1': this.model.settings.colorBlind.vision, 
                'cd6': this.model.settings.legend.show,
                'cd15': this.meta.dev
            });

            //Color Blind module
            OKVizUtility.applyColorBlindVision(this.model.settings.colorBlind.vision, this.element);
        }

        public destroy(): void {
           
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var objectName = options.objectName;
            var objectEnumeration: VisualObjectInstance[] = [];

            switch(objectName) {
                case 'xAxis':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.xAxis.show,
                            "gridline": this.model.settings.xAxis.gridline,
                            "fill": this.model.settings.xAxis.fill
                        },
                        selector: null
                    });

                    if (this.model.dataPoints.length > 0) {
                        let categoryIsDate = (Object.prototype.toString.call(this.model.dataPoints[0].category) === '[object Date]');
                        if (categoryIsDate) {
                            objectEnumeration.push({
                                objectName: objectName,
                                properties: {
                                    "type": this.model.settings.xAxis.type
                                },
                                selector: null
                            });
                        }
                    }

                    break;

                case 'yAxis':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.yAxis.show,
                            "start": this.model.settings.yAxis.start,
                            "end": this.model.settings.yAxis.end,
                            "fill": this.model.settings.yAxis.fill,
                            "unit": this.model.settings.yAxis.unit,
                            "precision": this.model.settings.yAxis.precision
                        },
                        selector: null
                    });

                    break;

                case 'dataLabels':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.dataLabels.show,
                            "fontSize": this.model.settings.dataLabels.fontSize,
                            "fill": this.model.settings.dataLabels.fill,
                            "unit": this.model.settings.dataLabels.unit,
                            "precision": this.model.settings.dataLabels.precision
                        },
                        selector: null
                    });

                    break;

                 case 'dataPoint':

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "fillShapes": this.model.settings.dataPoint.fillShapes
                        },
                        selector: null
                    });

                    if (!this.model.showLegend) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "defaultFill" : this.model.settings.dataPoint.defaultFill,
                                "showAll": this.model.settings.dataPoint.showAll
                            },
                            selector: null
                        });
                    }

                    if (this.model.showLegend || this.model.settings.dataPoint.showAll) {
                        let maxDataPoints = 1000;
                        for(let i = 0; i < Math.min(maxDataPoints, this.model.legendDataPoints.length); i++) {
                            let legendDataPoint = this.model.legendDataPoints[i];

                            objectEnumeration.push({
                                objectName: objectName,
                                displayName: legendDataPoint.label,
                                properties: {
                                    "fill": {
                                        solid: {
                                            color: legendDataPoint.color
                                        }
                                    }
                                },
                                selector: (<any>legendDataPoint.identity).getSelector()
                            });

                        }
                    }
                    break;

                 case 'legend':
                    if (this.model.legendDataPoints.length > 0) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "show": this.model.settings.legend.show,
                                "position": this.model.settings.legend.position,
                                "showTitle": this.model.settings.legend.showTitle,
                                "titleText": this.model.settings.legend.titleText,
                                "labelColor": this.model.settings.legend.labelColor,
                                "fontSize": this.model.settings.legend.fontSize
                            },
                            selector: null
                        });
                    }
                    break;

                case 'colorBlind':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "vision": this.model.settings.colorBlind.vision
                        },
                        selector: null
                    });

                    break;
                
            };

            return objectEnumeration;
        }
    }
}