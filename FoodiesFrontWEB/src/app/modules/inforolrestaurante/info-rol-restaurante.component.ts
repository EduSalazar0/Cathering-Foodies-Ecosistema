import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-info-rol-restaurante',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './info-rol-restaurante.component.html',
  styleUrls: ['./info-rol-restaurante.component.css']
})
export class InfoRolRestauranteComponent {

  // Información de contacto
  contactInfo = {
    email: 'info@foodiesbnb.com',
    whatsapp: '+593 98 276 4015',
    telefono: '+593 98 276 4015'
  };

  // Beneficios para restaurantes
  beneficios = [
    {
      icon: 'fas fa-video',
      titulo: 'Contenido UGC de Calidad',
      descripcion: 'Obtén contenido UGC de calidad promocionando tu negocio.'
    },
    {
      icon: 'fas fa-sync-alt',
      titulo: 'Volumen de Contenido',
      descripcion: 'Contenido UGC de manera constante para el negocio.'
    },
    {
      icon: 'fas fa-bolt',
      titulo: 'Collabs Rápidas',
      descripcion: 'No te preocupes en encontrar microinfluencers locales, nosotros lo hacemos por ti.'
    },
    {
      icon: 'fas fa-globe-americas',
      titulo: 'Más Alcance',
      descripcion: 'Tu negocio llegará a miles de clientes potenciales gracias al contenido UGC.'
    },
    {
      icon: 'fas fa-dollar-sign',
      titulo: 'Baja Inversión',
      descripcion: 'Contenido promocional constante por un monto mínimo de inversión.'
    },
    {
      icon: 'fas fa-mobile-alt',
      titulo: 'Aplicación para Negocios',
      descripcion: 'Completa la información y únete a la red de negocios de FoodiesBNB.'
    }
  ];

  // Requisitos para unirse
  requisitos = [
    'Estar ubicados en Quito, Ecuador',
    'Tener un local físico',
    'Cumplir con nuestros estándares estéticos'
  ];

  // Método para abrir WhatsApp
  abrirWhatsApp(): void {
    const mensaje = 'Hola! Estoy interesado en unir mi negocio a FoodiesBNB para generar contenido UGC. Me gustaría recibir más información sobre los beneficios y requisitos.';
    const url = `https://wa.me/${this.contactInfo.whatsapp.replace(/\s/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  // Método para enviar email
  enviarEmail(): void {
    const asunto = 'Interés en unir negocio a FoodiesBNB - Contenido UGC';
    const cuerpo = 'Estimado equipo de FoodiesBNB,\n\nEstoy interesado en unir mi negocio a su plataforma para generar contenido UGC con microinfluencers. Me gustaría recibir más información sobre:\n\n- Beneficios del programa\n- Requisitos para participar\n- Proceso de incorporación\n- Costos y modalidades\n\nMi negocio está ubicado en Quito, Ecuador y cumple con los requisitos básicos.\n\nGracias por su atención.';
    const url = `mailto:${this.contactInfo.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.open(url, '_blank');
  }

  // Método para llamar por teléfono
  llamarTelefono(): void {
    window.open(`tel:${this.contactInfo.telefono}`, '_self');
  }
}