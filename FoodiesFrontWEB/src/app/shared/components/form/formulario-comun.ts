import { ChangeDetectorRef, Component, Injector } from "@angular/core"
import { ConfirmationService, MessageService } from 'primeng/api'
import { ActivatedRoute, Router } from "@angular/router"
import { FormBuilder, FormGroup } from "@angular/forms"

@Component({
  template: '',
  standalone: true,
  providers: [ConfirmationService, MessageService],
})
export class FormularioComun {
  displayDialog = false;
  form!: FormGroup;
  isSaving: boolean = false;
  isEditMode = false;

  protected messageService: MessageService;
  protected router: Router;
  protected route: ActivatedRoute;
  protected confirmationService: ConfirmationService;
  protected fb: FormBuilder;
  protected cdr: ChangeDetectorRef;

  constructor(injector: Injector) {
    this.fb = injector.get(FormBuilder);
    this.cdr = injector.get(ChangeDetectorRef);
    this.messageService = injector.get(MessageService);
    this.router = injector.get(Router);
    this.route = injector.get(ActivatedRoute);
    this.confirmationService = injector.get(ConfirmationService);
    this.registraControl();
  }

  salir() {
    this.isEditMode = false;
    this.displayDialog = false;
    this.form.reset();
  }

  async onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSaving = true;
    await this.guardar();
    this.isSaving = false;
    this.salir();
    this.messageService.add({
      severity: 'success',
      summary: 'Datos almacenados correctamente',
      life: 6000,
    });
  }

  async guardar() {}

  registraControl() {}
}
