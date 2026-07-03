import { Component, OnInit, Injector } from '@angular/core'; // <-- 1. Importar ChangeDetectorRef
import { Validators } from '@angular/forms';
import { ParametroService } from '../../core/services/parametro.service';
import { Parametro } from '../../core/models/parametro.model';
import { Column } from '../../core/models/column.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { DataTableComponent } from '../../shared/components/data-table/datatable.component';
import { TagComponent } from '../../shared/components/tag/tag.component';
import { ToolbarComponent } from '../../shared/components/toolbar/toolbar.component';
import { AppTemplateDirective } from '../../shared/components/directive/template.directive';
import { FormularioComun } from '../../shared/components/form/formulario-comun';
import { DialogComponent } from '../../shared/components/dialog/dialog.component';
import { FormComponent } from '../../shared/components/form/form';
import { InputDateComponent } from '../../shared/components/input-date/input-date.component';
import { InputNumberComponent } from '../../shared/components/input-number/input-number.component';
import { InputSwitchComponent } from '../../shared/components/input-switch/input-switch.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { firstValueFrom } from 'rxjs';
import { FORM_SHARED_IMPORTS } from '../../shared/components/form/form_imports';

@Component({
  selector: 'app-parametros',
  standalone: true,
  imports: [
    ...FORM_SHARED_IMPORTS,//imports genericos de clases
    ButtonComponent,
    DataTableComponent,
    ToolbarComponent,
    TagComponent,
    AppTemplateDirective,
    DialogComponent,
    FormComponent,
    InputComponent,
    SelectComponent,
    InputSwitchComponent,
    InputNumberComponent,
    InputDateComponent,
  ],
  templateUrl: './parametros.html',
})
export class Parametros extends FormularioComun implements OnInit {
  parametro?: Parametro;
  parametros: Parametro[] = [];

  valueTypes = [
    { label: 'Texto', value: 'valorTexto' },
    { label: 'Número Entero', value: 'valorEntero' },
    { label: 'Número Decimal', value: 'valorDecimal' },
    { label: 'Fecha', value: 'valorFecha' },
    { label: 'Booleano (Sí/No)', value: 'valorBoolean' },
  ];

  columns: Column[] = [
    { field: 'codigo', header: 'Código' },
    { field: 'descripcion', header: 'Descripción' },
    { field: 'valor', header: 'Valor' },
    { field: 'estaActivo', header: 'Estado' },
  ];

  constructor(private parametroService: ParametroService, injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadParameters();
    this.setupDynamicValidators();
  }

  loadParameters(): void {
    this.parametroService.getAll().subscribe({
      next: (data) => {
        this.parametros = data;
        this.cdr.detectChanges();
      },
    });
  }

  openNew(): void {
    this.displayDialog = true;
    this.form.markAllAsTouched();
  }

  getDisplayValue(parametro: Parametro): string {
    if (parametro.valorTexto !== null) return parametro.valorTexto;
    if (parametro.valorEntero !== null) return parametro.valorEntero.toString();
    if (parametro.valorDecimal !== null)
      return parametro.valorDecimal.toString();
    if (parametro.valorFecha !== null)
      return new Date(parametro.valorFecha).toLocaleDateString();
    if (parametro.valorBoolean !== null)
      return parametro.valorBoolean ? 'Sí' : 'No';
    return 'N/A';
  }

  override registraControl(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.maxLength(250)]],
      tipoValor: ['valorTexto', { nonNullable: true }, Validators.required],
      valorTexto: [null, Validators.required],
      valorEntero: [null],
      valorDecimal: [null],
      valorFecha: [null],
      valorBoolean: [null],
      estaActivo: [true, { nonNullable: true }],
    });
  }

  setupDynamicValidators(): void {
    const tipoValorControl = this.form.get('tipoValor');
    const valorControls = [
      'valorTexto',
      'valorEntero',
      'valorDecimal',
      'valorFecha',
      'valorBoolean',
    ];

    tipoValorControl?.valueChanges.subscribe((tipo) => {
      if (tipoValorControl.untouched) return;
      valorControls.forEach((controlName) => {
        const control = this.form.get(controlName);
        control?.setValue(null);
        control?.removeValidators([Validators.required]);
        control?.clearValidators();
        control?.updateValueAndValidity();
      });

      if (tipo && tipo != 'valorBoolean') {
        this.form.get(tipo)?.setValidators([Validators.required]);
        this.form.get(tipo)?.updateValueAndValidity();
      }
    });
  }

  editParameter(parametro: Parametro): void {
    this.isEditMode = true;

    let tipoValorDetectado = 'valorTexto';
    if (parametro.valorEntero !== null) tipoValorDetectado = 'valorEntero';
    else if (parametro.valorDecimal !== null)
      tipoValorDetectado = 'valorDecimal';
    else if (parametro.valorFecha !== null) tipoValorDetectado = 'valorFecha';
    else if (parametro.valorBoolean !== null)
      tipoValorDetectado = 'valorBoolean';

    const formValue = {
      ...parametro,
      tipoValor: tipoValorDetectado,
    };
    this.parametro = formValue;
    this.form.patchValue(formValue);

    this.displayDialog = true;
  }

  override async guardar(): Promise<void> {
    const formValue = this.form.getRawValue();
    const values = { ...this.parametro, ...formValue };
    const request$ = this.isEditMode
      ? this.parametroService.update(values.id, values)
      : this.parametroService.create(values);

    await firstValueFrom(request$);
    this.loadParameters();
  }
}
