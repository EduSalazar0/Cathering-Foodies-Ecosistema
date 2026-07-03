import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormularioFoodieService } from '../../core/services/formulario-foodie.service';
import { FormularioFoodieCreate, FormularioFoodieUpdate, FormularioFoodieSubmissionResponse } from '../../core/models/formulario-foodie.model';

@Component({
  selector: 'app-formulario-foodie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-foodie.component.html',
  styleUrls: ['./formulario-foodie.component.css']
})
export class FormularioFoodieComponent implements OnInit {
  
  foodieForm!: FormGroup;
  isSaving = false;
  isEditing = false;
  formularioId?: number;
  
  // Propiedades para notificación simple
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private formBuilder: FormBuilder,
    private formularioFoodieService: FormularioFoodieService
  ) {}
  
  // Métodos para notificación simple
  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 5000): void {
    this.notificationMessage = message;
    this.notificationType = type;
    
    // Auto-ocultar después del tiempo especificado
    setTimeout(() => {
      this.hideNotification();
    }, duration);
  }

  hideNotification(): void {
    this.notificationMessage = '';
  }

  getNotificationIcon(): string {
    switch (this.notificationType) {
      case 'success': return 'pi-check-circle';
      case 'error': return 'pi-times-circle';
      case 'info': return 'pi-info-circle';
      default: return 'pi-info-circle';
    }
  }
  readonly paisesDisponibles = [
    { value: 'ecuador', label: 'Ecuador' }
  ];
  
  readonly ciudadesDisponibles = [
    { value: 'quito', label: 'Quito' },
    { value: 'guayaquil', label: 'Guayaquil' }
  ];
  
  readonly frecuenciaContenido = [
    { value: 'diario', label: 'Diariamente' },
    { value: 'varios-por-semana', label: 'Varias veces por semana' },
    { value: 'semanal', label: 'Semanalmente' },
    { value: 'quincenal', label: 'Cada dos semanas' },
    { value: 'mensual', label: 'Mensualmente' }
  ];
  
  readonly generoOpciones = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' }
  ];
  
  readonly cuentaPublicaOpciones = [
    { value: true, label: 'Sí, es pública.' },
    { value: false, label: 'No, es privada.' }
  ];
  
  readonly beneficiosOpciones = [
    { value: 'acepto', label: 'Sí, estoy de acuerdo con los beneficios ofrecidos.' },
    { value: 'no-acepto', label: 'No, no estoy de acuerdo con los beneficios. (no envíes tu aplicación)' }
  ];

  ngOnInit(): void {
    console.log('FormularioFoodieComponent inicializado');
    this.inicializarFormulario();
    this.verificarFormularioExistente();
  }

  private async verificarFormularioExistente(): Promise<void> {
    try {
      const formulario = await this.formularioFoodieService.getMyFormulario().toPromise();
      if (formulario) {
        this.isEditing = true;
        this.formularioId = formulario.id;
        this.cargarDatosFormulario(formulario);
        this.showNotification('Ya tienes un formulario registrado. Puedes actualizarlo.', 'info', 5000);
      }
    } catch (error: any) {
      if (error.status !== 404) {
        console.error('Error al verificar formulario existente:', error);
      }
    }
  }

  private cargarDatosFormulario(formulario: any): void {
    this.foodieForm.patchValue({
      nombreCompleto: formulario.nombreCompleto,
      email: formulario.email,
      numeroPersonal: formulario.numeroPersonal,
      fechaNacimiento: new Date(formulario.fechaNacimiento),
      genero: formulario.genero,
      pais: formulario.pais,
      ciudad: formulario.ciudad,
      frecuenciaContenido: formulario.frecuenciaContenido,
      usuarioInstagram: formulario.usuarioInstagram,
      seguidoresInstagram: formulario.seguidoresInstagram.toString(),
      cuentaPublica: formulario.cuentaPublica,
      usuarioTikTok: formulario.usuarioTikTok,
      seguidoresTikTok: formulario.seguidoresTikTok.toString(),
      sobreTi: formulario.sobreTi,
      aceptaBeneficios: formulario.aceptaBeneficios,
      aceptaTerminos: formulario.aceptaTerminos
    });
  }

  private inicializarFormulario(): void {
    this.foodieForm = this.formBuilder.group({
      // Información personal
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      numeroPersonal: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      
      // Ubicación
      pais: ['ecuador', [Validators.required]],
      ciudad: ['', [Validators.required]],
      
      // Redes sociales
      frecuenciaContenido: ['', [Validators.required]],
      usuarioInstagram: ['', [Validators.required, Validators.pattern(/^@[a-zA-Z0-9._]+$/)]],
      seguidoresInstagram: ['', [Validators.required, Validators.min(1000), Validators.pattern(/^\d+$/)]],
      cuentaPublica: [null, [Validators.required]],
      usuarioTikTok: ['', [Validators.required, Validators.pattern(/^@[a-zA-Z0-9._]+$/)]],
      seguidoresTikTok: ['', [Validators.required, Validators.min(1000), Validators.pattern(/^\d+$/)]],
      
      // Descripción y términos
      sobreTi: ['', [Validators.required, Validators.minLength(20)]],
      aceptaBeneficios: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.foodieForm.valid) {
      this.isSaving = true;
      
      // Mostrar notificación inmediata de que se está procesando
      this.showNotification('Aplicación enviada', 'success', 5000);
      
      try {
        if (this.isEditing) {
          await this.actualizarFormulario();
        } else {
          await this.crearFormulario();
        }
      } catch (error) {
        console.error('Error al procesar formulario:', error);
      } finally {
        this.isSaving = false;
      }
    } else {
      this.marcarCamposInvalidos();
      this.showNotification('Por favor, completa todos los campos requeridos correctamente.', 'error', 5000);
    }
  }

  private async crearFormulario(): Promise<void> {
    const formData: FormularioFoodieCreate = this.buildCreateModel();
    
    this.formularioFoodieService.create(formData).subscribe({
      next: (response: FormularioFoodieSubmissionResponse) => {
        if (response.success) {
          // Mensaje principal de éxito usando el mensaje del backend
          this.showNotification(response.message, 'success', 8000);
          
          // Si hay datos del formulario, actualizar el estado
          if (response.formularioData) {
            this.isEditing = true;
            this.formularioId = response.formularioData.id;
          }
          
          // Si hay mensaje sobre el rol, mostrarlo después de un tiempo
          if (response.rolMessage) {
            setTimeout(() => {
              if (response.rolFoodieAsignado) {
                this.showNotification('¡Felicitaciones, eres Foodie! ' + response.rolMessage, 'success', 10000);
              } else {
                this.showNotification(response.rolMessage || 'Información adicional disponible', 'info', 7000);
              }
            }, 3000);
          }
        } else {
          // Error del backend con mensaje personalizado
          this.showNotification(response.message, 'error', 8000);
        }
      },
      error: (error) => {
        console.error('Error al crear formulario:', error);
        
        // Manejo de errores específicos
        let errorMessage = 'Hubo un problema al enviar tu formulario. Por favor, inténtalo nuevamente.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.showNotification(errorMessage, 'error', 8000);
      }
    });
  }

  private async actualizarFormulario(): Promise<void> {
    const formData: FormularioFoodieUpdate = this.buildUpdateModel();
    
    this.formularioFoodieService.updateMyFormulario(formData).subscribe({
      next: (response) => {
        // Mensaje principal de actualización
        this.showNotification('✅ Información Actualizada - Tus datos han sido actualizados correctamente. Gracias por mantenerte al día.', 'success', 6000);
        
        // Verificar si ahora cumple requisitos para rol foodie
        if (response.seguidoresInstagram >= 1000 || response.seguidoresTikTok >= 1000) {
          setTimeout(() => {
            this.showNotification(`🎊 ¡Ahora eres Foodie! Con tus nuevos números de seguidores (${response.seguidoresInstagram} en Instagram, ${response.seguidoresTikTok} en TikTok), ahora tienes el rol Foodie. ¡Disfruta de los beneficios!`, 'success', 9000);
          }, 1000);
        }
      },
      error: (error) => {
        console.error('Error al actualizar formulario:', error);
        this.showNotification('Hubo un problema al actualizar tu información. Por favor, inténtalo nuevamente.', 'error', 6000);
      }
    });
  }

  private buildCreateModel(): FormularioFoodieCreate {
    const formValue = this.foodieForm.value;
    
    return {
      nombreCompleto: formValue.nombreCompleto.trim(),
      email: formValue.email.toLowerCase().trim(),
      numeroPersonal: formValue.numeroPersonal,
      fechaNacimiento: new Date(formValue.fechaNacimiento),
      genero: formValue.genero,
      pais: formValue.pais,
      ciudad: formValue.ciudad,
      frecuenciaContenido: formValue.frecuenciaContenido,
      usuarioInstagram: formValue.usuarioInstagram.trim(),
      seguidoresInstagram: parseInt(formValue.seguidoresInstagram),
      cuentaPublica: formValue.cuentaPublica,
      usuarioTikTok: formValue.usuarioTikTok.trim(),
      seguidoresTikTok: parseInt(formValue.seguidoresTikTok),
      sobreTi: formValue.sobreTi.trim(),
      aceptaBeneficios: formValue.aceptaBeneficios,
      aceptaTerminos: formValue.aceptaTerminos
    };
  }

  private buildUpdateModel(): FormularioFoodieUpdate {
    const formValue = this.foodieForm.value;
    
    return {
      nombreCompleto: formValue.nombreCompleto.trim(),
      email: formValue.email.toLowerCase().trim(),
      numeroPersonal: formValue.numeroPersonal,
      fechaNacimiento: new Date(formValue.fechaNacimiento),
      genero: formValue.genero,
      pais: formValue.pais,
      ciudad: formValue.ciudad,
      frecuenciaContenido: formValue.frecuenciaContenido,
      usuarioInstagram: formValue.usuarioInstagram.trim(),
      seguidoresInstagram: parseInt(formValue.seguidoresInstagram),
      cuentaPublica: formValue.cuentaPublica,
      usuarioTikTok: formValue.usuarioTikTok.trim(),
      seguidoresTikTok: parseInt(formValue.seguidoresTikTok),
      sobreTi: formValue.sobreTi.trim(),
      aceptaBeneficios: formValue.aceptaBeneficios,
      aceptaTerminos: formValue.aceptaTerminos
    };
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.foodieForm.controls).forEach(key => {
      const control = this.foodieForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
      }
    });
  }

  // Getters para validaciones en el template
  get nombreCompletoInvalid(): boolean {
    const control = this.foodieForm.get('nombreCompleto');
    return !!(control && control.invalid && control.touched);
  }

  get emailInvalid(): boolean {
    const control = this.foodieForm.get('email');
    return !!(control && control.invalid && control.touched);
  }

  get numeroPersonalInvalid(): boolean {
    const control = this.foodieForm.get('numeroPersonal');
    return !!(control && control.invalid && control.touched);
  }

  get usuarioInstagramInvalid(): boolean {
    const control = this.foodieForm.get('usuarioInstagram');
    return !!(control && control.invalid && control.touched);
  }

  get seguidoresInstagramInvalid(): boolean {
    const control = this.foodieForm.get('seguidoresInstagram');
    return !!(control && control.invalid && control.touched);
  }

  get usuarioTikTokInvalid(): boolean {
    const control = this.foodieForm.get('usuarioTikTok');
    return !!(control && control.invalid && control.touched);
  }

  get seguidoresTikTokInvalid(): boolean {
    const control = this.foodieForm.get('seguidoresTikTok');
    return !!(control && control.invalid && control.touched);
  }

  get sobreTiInvalid(): boolean {
    const control = this.foodieForm.get('sobreTi');
    return !!(control && control.invalid && control.touched);
  }

  get caracteresRestantes(): number {
    const sobreTi = this.foodieForm.get('sobreTi')?.value || '';
    return Math.max(0, 20 - sobreTi.length);
  }

  get caracteresTotales(): number {
    const sobreTi = this.foodieForm.get('sobreTi')?.value || '';
    return sobreTi.length;
  }

  // Métodos para validar entrada de seguidores
  onSeguidoresKeypress(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    const char = String.fromCharCode(charCode);
    
    // Solo permitir números (0-9)
    if (!/[0-9]/.test(char)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onSeguidoresPaste(event: ClipboardEvent): boolean {
    const pastedText = event.clipboardData?.getData('text') || '';
    // Solo permitir texto que contenga solo números
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onSeguidoresInput(event: any, fieldName: string): void {
    let value = event.target.value;
    // Remover cualquier carácter que no sea número
    value = value.replace(/[^0-9]/g, '');
    // Actualizar el valor en el formulario
    this.foodieForm.get(fieldName)?.setValue(value);
  }
}