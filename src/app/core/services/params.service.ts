import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { map, tap, delay, finalize, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

export class Seznamy {
    znacka: any;
    model: any;
    druh: any;
    rok_vyroby: any;
    palivo: any;
    uziti: any;
    najezd: any;
    vozidloZabezpeceni: any;    
    osobaTyp: any;
    pojistnik: {
        psc: any;
        castiobce: any;
    }
    provozovatel: {
        psc: any;
        castiobce: any;
    }    
}

@Injectable()
export class ParamsService {

    public lists: Seznamy; 
    public layout;

    constructor(private http: HttpClient) { }

    initParams() {    
        this.lists = {
            znacka: [{
                value: -1,
                label: 'Nejčastější značky',
                children: [
                    { value: 195, 'label': 'Škoda' },
                    { value: 127, 'label': 'Ford' },
                    { value: 182, 'label': 'Renault' },
                    { value: 175, 'label': 'Peugeot' },
                    { value: 209, 'label': 'Volkswagen' },
                    { value: 174, 'label': 'Opel' },
                    { value: 126, 'label': 'Fiat' },
                    { value: 117, 'label': 'Citroën' },
                    { value: 190, 'label': 'Seat' }
                ]
            }],
            model: [],
            druh: [],
            rok_vyroby: [],
            palivo: [],
            uziti: [],
            najezd: [],
            vozidloZabezpeceni: {},
            osobaTyp: [],
            pojistnik: {
                psc: [],
                castiobce: []
            },
            provozovatel: {
                psc: [],
                castiobce: []
            }
        };

        this.getParametry().subscribe((result: Boolean) => {});

        this.layout = {
            grid: {
                column : 'col-lg-6',
                label : 'col-sm-5',
                input : 'col-sm-7',
                offset : 'offset-sm-5',
                label2 : 'col-md-7 col-sm-7',
                input2 : 'col-md-5 col-sm-5',
                column1 : 'order-3 order-md-0 col-md-7 col-lg-6 col-xl-7',
                column2 : 'order-2 col-md-5 col-lg-5 offset-lg-1 col-xl-4',
                info1 : 'col-sm-3 col-md-12',
                info2 : 'col-sm-9 col-md-12',
            },
            table : true,
            helper : 'none',
            produktCollapsed : {},
            filtrCollapsed : true,
            controls : {
                druh: null
            },
            prvniNapoveda : true,
            form_r : {
                loading : false,
                error : false
            },
            progress: 0,
            kalkulaceAktivni : false,
            kalkulaceMailOdeslan : false,
            dataNacitani : false
          };        
        
    }

    getParametry(): Observable<Boolean> {
        const path = 'https://www.srovnavac.eu/api/vozidla/app/parametry';
        return this.http.get(`${path}`).pipe(
            tap(val => {
                // console.log('getParams STARTED');
            }),
            delay(0),
            map(data => {
                let resp = true;
                if (data['vozidloDruh']) {
                    Object.keys(data['vozidloDruh']).forEach(key => {
                        this.lists.druh.push( { value: Number(key), 'label': data['vozidloDruh'][key] } );
                    });
                } else {
                    resp = false;
                }
                if (data['vozidloPalivo']) {
                    Object.keys(data['vozidloPalivo']).forEach(key => {
                        this.lists.palivo.push( { value: Number(key), 'label': data['vozidloPalivo'][key] } );
                    });
                } else {
                    resp = false;
                }   
                if (data['vozidloUziti']) {
                    Object.keys(data['vozidloUziti']).forEach(key => {
                        this.lists.uziti.push( { value: Number(key), 'label': data['vozidloUziti'][key] } );
                    });
                } else {
                    resp = false;
                }   
                if (data['vozidloNajezd']) {
                    Object.keys(data['vozidloNajezd']).forEach(key => {
                        this.lists.najezd.push( { value: Number(key), 'label': data['vozidloNajezd'][key] } );
                    });
                } else {
                    resp = false;
                }
                if (data['vozidloZabezpeceni']) {
                    this.lists.vozidloZabezpeceni = data['vozidloZabezpeceni'];
                    /*
                    Object.keys(data['vozidloZabezpeceni']).forEach(key => {
                        this.lists.vozidloZabezpeceni.push( { value: Number(key), 'label': data['vozidloZabezpeceni'][key] } );
                    }); */
                } else {
                    resp = false;
                }                
                if (data['vozidloZnackaModel']) {
                    let znacka = {
                        value: 0,
                        label: 'Abecední řazení',
                        children: []
                    };
                    let znacky = {}
                    Object.keys(data['vozidloZnackaModel']).forEach(key => {
                        if (Number(key) < 50000 || Number(key) == 99999) {
                            this.lists.model.push( { value: Number(key), znacka: Number(data['vozidloZnackaModel'][key].idznacka), label: data['vozidloZnackaModel'][key].typ } );
                            znacky[Number(data['vozidloZnackaModel'][key].idznacka)] = data['vozidloZnackaModel'][key].znacka;
                        }
                    });
                    Object.keys(znacky).forEach(key => {
                        znacka.children.push( { value: Number(key), label: znacky[key] } );
                    });
                    this.lists.znacka.push(znacka);
                } else {
                    resp = false;
                }                
                if (data['osobaTyp']) {
                    Object.keys(data['osobaTyp']).forEach(key => {
                        this.lists.osobaTyp.push( { value: Number(key), 'label': data['osobaTyp'][key] } );
                    });
                } else {
                    resp = false;
                }                                                          
                return resp;
              }
            ),            
            finalize(() => {
                // console.log('getParams COMPLETED');
            })
        );
    }

    /**
     * Nová verze doplňování adres - komponenta adresa
     * @param  {String} co hledany parametr adresy [ulice, cp, psc, obec]
     * @param  {String} token retezec naseptavace
     * @param  {Object} data objekt s udaji adresy
     * @return {Observable[]}  vrací pole s objekty adres
     */    
     getHledej(co, token, data)  {
        // console.log('https://www.srovnavac.eu/ruian/hledej?q=' + co + '&coid=' + data.cast_obce_id
        //     + '&psc=' + data.psc + '&cp=' + data.cp + '&ulice=' + data.ulice + '&obec=' + data.obec);
        let cp = data.cp.split("/");
        if (cp.length > 1) cp = cp[0];
        return this.http.get<any[]>('https://www.srovnavac.eu/ruian/hledej?q=' + co
             + '&coid=' + (data.cast_obce_id ? data.cast_obce_id : '')
             + '&psc=' + (data.psc ? data.psc : '')
             + '&cp=' + (cp ? cp : '')
             + '&ulice='+ (data.ulice ? data.ulice : '')
             + '&obec=' + (data.obec ? data.obec : '')
            );
    }    
}
