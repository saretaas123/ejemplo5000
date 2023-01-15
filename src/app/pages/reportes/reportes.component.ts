import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { PsicologoService } from 'src/app/services/auroraapi/psicologo.service';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { EstadisticaPacientesService } from 'src/app/services/auroraapi/estadisticaPacientes.service';
import { UbigeoService} from 'src/app/services/auroraapi/ubigeo.service'




@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  DepartamentList: any;

   // CREACION DE PDF
   downloadPDF() {
    // Extraemos el
    const DATA : any = document.getElementById('htmlData');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 3
    };
    html2canvas(DATA, options)
    .then((canvas) => {

      const img = canvas.toDataURL('image/PNG');

      // Add image Canvas to PDF
      const bufferX = 15;
      const bufferY = 15;
      const imgProps = (doc as any).getImageProperties(img);
      const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(
        img,
        'PNG',
        bufferX,
        bufferY,
        pdfWidth,
        pdfHeight,
        undefined,
        'FAST');
      return doc;
    }).then((docResult) => {
      docResult.save(`${new Date().toISOString()}_Reportes.pdf`);
    });
  }
  //FIN CREACION DE PDF

  g_FromUser_PsicologoId: number = 1;

  private ApiFullobjPsicologoFullInfo : any = {
    mnsj: '',
    rpta : {}
  };

  public objPsicologoFullInfo : any = {
    nombres: '',
    apellidoMaterno:'',
    apellidoPaterno:'',
    cantPacientes : 0,
    correo : '',
    dni : '',
    especialidad : '',
    numeroDeColegiaturaDelPeru : '',
    psicologoId : 0,
    telefono : '',
    usuarioId : 0
  };

  ApiFullobjListarDepartamento : any ={
    mnsj: "",
    rpta: [
      {
      depaId: 0,
      nombreDepa: ""
      },
    ]
  };

  ApiFullobjListarProvincia : any ={
    mnsj: "",
    rpta: [
      {
        provId: 0,
        nombreProv: "",
        depaId: 0
      },
    ]
  };

  ApiFullobjListarDistrito : any ={
    mnsj: "",
    rpta: [
      {
        distId: 0,
        nombreDist: "",
        provId: 0
      },
    ]
  };



  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;


  constructor(
    private PsicologoService: PsicologoService,
    private _EstadisticaPacientesService : EstadisticaPacientesService,
    private _UbigeoService:UbigeoService) { }

  ngOnInit(): void {
    this.ObtenerPsicologoInfo();
    this.ObtenerDepartamentos();
    this.ObtenerProvincia();
    this.ObtenerDistrito();
  }

  listDepartamentosForFilter :
    [{
      depaId: 0,
      nombreDepa: ""
    }] = [{ depaId: 0, nombreDepa: "" }];

  listProvinciasForFilter :
    [{
      provId: 0,
      nombreProv: "",
      depaId: 0
    }] = [{ provId: 0, nombreProv: "", depaId: 0 }];

  listDistritosForFilter :
    [{
      distId: 0,
      nombreDist: "",
      provId: 0
    }] = [{ distId: 0, nombreDist: "", provId: 0 }];

  ObtenerPsicologoInfo()
  {
    this.PsicologoService.GetPsicologoFullInfoByPsicologoId(this.g_FromUser_PsicologoId+"").subscribe(apiRpta => {
      this.ApiFullobjPsicologoFullInfo = apiRpta;
      console.log(this.ApiFullobjPsicologoFullInfo.mnsj);
      this.objPsicologoFullInfo = this.ApiFullobjPsicologoFullInfo.rpta;
    });
  }

  ObtenerDepartamentos(){
    this._UbigeoService.GetDepartamentoListar().subscribe(apiRpta1 => {
      this.ApiFullobjListarDepartamento = apiRpta1;

      this.listDepartamentosForFilter = this.ApiFullobjListarDepartamento.rpta;
    })
  }

  ObtenerProvincia(){
    this._UbigeoService.GetProvinciaListar().subscribe(apiRpta2 => {
      this.ApiFullobjListarProvincia = apiRpta2;

      this.listProvinciasForFilter = this.ApiFullobjListarProvincia.rpta;
    })
  }

  ObtenerDistrito(){
    this._UbigeoService.GetDistritoListar().subscribe(apiRpta3 => {
      this.ApiFullobjListarDistrito = apiRpta3;

      this.listDistritosForFilter = this.ApiFullobjListarDistrito.rpta;
    })
  }

  Departamento_isChanged : number = -1;

  onChange_DepartamentoSeleccionado(idDepartamentoSeleccionado : any){

    if(this.Departamento_isChanged===-1){
      this.Departamento_isChanged = 0;

      this.FiltrarResultados_Departamento_a_Provincia(idDepartamentoSeleccionado);
      console.log("listProvinciasForFilter:",this.listProvinciasForFilter);
    }else if(this.Departamento_isChanged===0){
      this.Departamento_isChanged = 1;

      this.FiltrarResultados_Departamento_a_Provincia(idDepartamentoSeleccionado);
      console.log("listProvinciasForFilter:",this.listProvinciasForFilter);
    }else if(this.Departamento_isChanged===1){
      //Sirve para corregir la seleccion ciclica > NO ELIMINAR
      this.Departamento_isChanged = 0;
    }
  }

  Provincia_isChanged : number = -1;
  onChange_ProvinciaSeleccionado(idProvinciaSeleccionado : any){

    if(this.Provincia_isChanged===-1){
      this.Provincia_isChanged = 0;

      this.FiltrarResultados_Provincia_a_Distrito(idProvinciaSeleccionado);
      console.log("listDistritosForFilter:",this.listDistritosForFilter);
    }else if(this.Provincia_isChanged===0){
      this.Provincia_isChanged = 1;

      this.FiltrarResultados_Provincia_a_Distrito(idProvinciaSeleccionado);
      console.log("listDistritosForFilter:",this.listDistritosForFilter);
    }else if(this.Provincia_isChanged===1){
      //Sirve para corregir la seleccion ciclica > NO ELIMINAR
      this.Provincia_isChanged = 0;
    }
  }

  FiltrarResultados_Departamento_a_Provincia(idDepartamentoSeleccionado : any)
  {
    this.listProvinciasForFilter = this.ApiFullobjListarProvincia.rpta.filter(
        (x:
          {
            provId: 0,
            nombreProv: "",
            depaId: 0
          }) => x.depaId === idDepartamentoSeleccionado);
  }

  FiltrarResultados_Provincia_a_Distrito(idProvinciaSeleccionado : any)
  {
    this.listDistritosForFilter = this.ApiFullobjListarDistrito.rpta.filter(
        (x:
          {
            distId: 0,
            nombreDist: "",
            provId: 0
          }) => x.provId === idProvinciaSeleccionado);
  }

}
