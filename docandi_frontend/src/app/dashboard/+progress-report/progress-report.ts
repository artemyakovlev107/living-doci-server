
import { Component, OnInit } from '@angular/core';
import { HttpMethod } from "../../shared/services/http.method";
import { Router } from '@angular/router';
declare var jQuery: any;
declare var Highcharts: any;
@Component({
    moduleId: module.id,
    selector: 'progress-report-cmp',
    templateUrl: 'progress-report.html',
})
export class ProgressReportComponent implements OnInit {
    http_method: any;
    baseUrl: string;
    userRole: number;
    goal: number;
    agreeToSwitch: number;
    patientOverGoal: number;
    weeklyResult: {
        dateEnd: any;
        dateStart: any;
        patientNumber: any,
        patientToGoal: any,
        patientSaving: any,
        agreeToSwitch: any,
        topPerformers: Array<{
            userName: string,
            patientNumber: any
        }>,
        topImprovement: Array<{
            userName: string,
            patientNumber: any
        }>
    };
    currentUser: {
        total_point: any,
        day_point: any,
        listTotalMonthPatientSaving: Array<{ month: any, total_patient: any }>,
        month_point: any,
        survey_day: {
            expected_patients: any
        },
        full_name: string,
        role: any,
        hospitalName: string

    };
    savings: any;
    options: any;
    levelText: any = 2;
    topPerformers: Array<{
        userName: string,
        patientNumber: any
    }>;
    topImprovement: Array<{
        userName: string,
        patientNumber: any
    }>;
    constructor(http_method: HttpMethod, private router: Router) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.currentUser = {
            total_point: 0,
            day_point: 0,
            listTotalMonthPatientSaving: [],
            month_point: 0,
            survey_day: {
                expected_patients: 0
            },
            full_name: null,
            role: 0,
            hospitalName: null

        };
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.userRole = this.currentUser.role;
        this.weeklyResult = {
            dateEnd: 0,
            dateStart: 0,
            patientNumber: null,
            patientToGoal: null,
            patientSaving: null,
            agreeToSwitch: null,
            topPerformers: [
                {
                    userName: null,
                    patientNumber: null
                }
            ],
            topImprovement: [{
                userName: null,
                patientNumber: null
            }]

        };
        this.topPerformers = [{
            userName: null,
            patientNumber: null
        }];
        this.topImprovement = [{
            userName: null,
            patientNumber: null
        }]
        this.getData();
    }

    ngOnInit() {

    }

    renderChart(patientNumber: any, goal: any) {
        var perShapeGradient = { x1: 0, y1: 0, x2: 1.2, y2: 1.2 };
        var perShapeGradientSelect = { x1: 0, y1: 1, x2: 0.99, y2: 0 };

        var chart = new Highcharts.Chart({
            chart: {
                renderTo: 'chartGauge',
                type: 'gauge',
                margin: [0, 0, 0, 0]

            },
            title: {
                text: '',
                style: {
                    color: '#7d7d7d',
                    fontSize: '20px',
                }
            },
            tooltip: {
                enabled: false
            },

            pane: {
                startAngle: -90,
                endAngle: 90,
                size: 300,

                background: [{
                    addRoundCorners: false,
                    backgroundColor: {
                        linearGradient: perShapeGradient,
                        stops: [
                            [0, 'rgb(12, 219, 196)'],
                            [1, 'rgb(133, 255, 86)']
                        ]
                    },
                    innerRadius: '100%',
                    outerRadius: '0',
                    shape: 'arc',

                }, {
                    backgroundColor: '#fff',
                    innerRadius: '0%',
                    outerRadius: '80%',
                    borderWidth: 0
                }, {
                    backgroundColor: '#fff',
                    innerRadius: '100%',
                    borderWidth: 0,
                    outerRadius: '100%'
                }


                ],


            },
            xAsis: {
                lineWidth: 0,
                minorGridLineWidth: 0,
                lineColor: 'transparent'
            },
            yAxis: {

                min: 0,
                max: 100,

                tickInterval: 1200,
                tickWidth: 0,
                minorTickLength: 18,
                minorTickWidth: 0,
                tickColor: 'red',
                labels: {
                    distance: 10,
                    step: 0,
                    rotation: 0,
                    enabled: true,
                    style: {
                        color: 'red',
                        fontWeigth: 'bold',
                        fontSize: 14,
                        display: 'block'
                    }
                },

                plotBands: [

                    { // mark the weekend
                        color: {
                            linearGradient: perShapeGradientSelect,
                            stops: [
                                //                                    [0, Highcharts.Color('#ff0093').setOpacity(0.5)],
                                //                                    [1, Highcharts.Color('#2de5a6').setOpacity(0.1)],
                                [0, 'rgb(255, 0, 147)'],
                                [1, 'rgb(45, 299, 166)']
                            ]
                        },

                        thickness: 30,
                        from: 0,
                        to: 40,
                        events: {
                            click: function () {

                            }
                        },
                        label: {
                            //                                text: 'I am a label',
                            //                                align: 'left',
                            //                                x: 100,
                            //                                y: 10
                        }
                    }

                ]

            },
            plotOptions: {

                gauge: {
                    dataLabels: {
                        enabled: true,
                        formatter:()=>{
                           return patientNumber
                        }
                    },
                    dial: {
                        radius: '88%',
                        backgroundColor: '#40484e',
                        borderColor: '#40484e',
                        borderWidth: 1,
                        baseWidth: 10,
                        topWidth: 1,
                        baseLength: '10%', // of radius
                        rearLength: '-10%'
                    },
                    pivot: {
                        radius: 5,
                        backgroundColor: '#40484e'
                    }
                },
            },

            series: [{
                name: 'Data',
                animation: false,
                data: [
                    0
                ],
            }],

            credits: {
                enabled: false
            },

        })
        var point = chart.series[0].points[0],
            newVal: any;
        newVal = patientNumber / goal * 100;
        point.update(newVal);
        // console.log(chart);
    };
    getData() {
        return this.http_method.callApi(this.baseUrl + "user/weeklyreport").subscribe((res: any) => {
            this.checkAccessdenied(res);
            
            this.weeklyResult = JSON.parse(res._body).Data;

            localStorage.setItem('weeklyResult', JSON.stringify(this.weeklyResult));
            if (this.userRole != 0) {
                this.agreeToSwitch = this.weeklyResult.agreeToSwitch;
            } else {

                this.savings = this.weeklyResult.patientSaving;
            }
            if (this.weeklyResult.patientToGoal < 0) {
                this.patientOverGoal = this.weeklyResult.patientToGoal * (-1);
            }
            // this.chartOption(this.weeklyResult.patientNumber,this.weeklyResult.patientToGoal);
            this.topPerformers = this.weeklyResult.topPerformers;
            this.topImprovement = this.weeklyResult.topImprovement;
            this.goal = this.weeklyResult.patientToGoal + this.weeklyResult.patientNumber;
            if (this.weeklyResult.patientNumber <= this.goal * 0.33) {
                this.levelText = 1;
            } else if (this.weeklyResult.patientNumber >= this.goal * 0.33 && this.weeklyResult.patientNumber <= this.goal * 0.66) {
                this.levelText = 2;
            } else {
                this.levelText = 3;
            }
            let url = this.router.url;
            if (url == '/dashboard/progress-report') {
                this.renderChart(this.weeklyResult.patientNumber, this.goal);
            }

        });
    };
    checkAccessdenied(res: any) {
        if (JSON.parse(res._body).Status == "access is denied") {
            localStorage.clear();
            this.router.navigate(['/', 'login']);
        }
    };

}

