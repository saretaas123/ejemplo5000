import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ficha-registro',
  templateUrl: './ficha-registro.component.html',
  styleUrls: ['./ficha-registro.component.css']
})
export class FichaRegistroComponent implements OnInit {

  g_FromUser_PsicologoId: string = '1';

  constructor() { }

  ngOnInit(): void {
  }

}
