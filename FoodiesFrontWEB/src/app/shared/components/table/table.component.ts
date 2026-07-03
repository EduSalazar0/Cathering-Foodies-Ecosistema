import { Component, ContentChild, EventEmitter, forwardRef, Input, Output, TemplateRef, OnInit, HostListener, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core'
import { FormArray, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { TooltipModule } from 'primeng/tooltip'
import { FieldErrorsComponent } from '../field-errors/field-errors.component'
import { InputComponent } from '../input/input.component'

// Interfaces para mejor tipado
export interface TableColumn {
  header: string
  fromControlName: string
  type?: 'text' | 'dropdown' | 'checkbox'
  style?: string
  pKeyFilter?: string
  upperCase?: boolean
  lowerCase?: boolean
  maxlength?: number
  maxvalue?: string
  optionLabel?: string
  values?: any[]
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    InputComponent,
    FieldErrorsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TableComponent),
      multi: true
    }
  ]
})
export class TableComponent implements OnInit {

  @ContentChild('header')
  public header!: TemplateRef<any>

  @ContentChild('body')
  public body!: TemplateRef<any>

  @Input()
  public parentForm!: FormGroup

  @Input()
  public controlName!: string

  @Input()
  public columnas: TableColumn[] = []

  @Input()
  public edit: boolean = false

  @Input()
  public delete: boolean = false

  @Input()
  public label?: string

  @Input()
  public icon?: string

  @Input()
  public loading: boolean = false

  @Input()
  public emptyMessage: string = 'No se encontraron registros'

  @Output()
  agregarItem = new EventEmitter<void>()

  @Output()
  eliminarItem = new EventEmitter<number>()

  public isMobile: boolean = false

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    this.checkScreenSize()
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize()
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768
    } else {
      this.isMobile = false // Default para SSR
    }
  }

  get formArray(): FormArray {
    return this.parentForm?.get(this.controlName) as FormArray
  }

  agregarItemClick(): void {
    this.agregarItem.emit()
  }

  eliminarItemClick(rowIndex: number): void {
    this.eliminarItem.emit(rowIndex)
  }

  getMax(rowData: FormGroup, col: TableColumn): string | number {
    if (col.maxvalue) {
      let maxlength: any = null
      col.maxvalue.split(",").forEach((key: string) => {
        if (!maxlength) {
          maxlength = rowData.value[key]
        } else if (maxlength && typeof maxlength === 'object') {
          maxlength = maxlength[key]
        }
      })
      return maxlength || col.maxlength || ''
    }
    return col.maxlength || ''
  }

  // Método para mejorar la accesibilidad
  getAriaLabel(action: string, index?: number): string {
    switch (action) {
      case 'add':
        return `Agregar nuevo elemento a ${this.label || 'tabla'}`
      case 'delete':
        return `Eliminar elemento ${index !== undefined ? index + 1 : ''} de ${this.label || 'tabla'}`
      default:
        return ''
    }
  }

  // Método para trackBy en ngFor para mejor performance
  trackByIndex(index: number): number {
    return index
  }

  trackByColumn(index: number, col: TableColumn): string {
    return col.fromControlName || index.toString()
  }
}
