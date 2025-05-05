import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { Event, EventResponse } from '../../../models/event.model';
import { LoadingService } from '../../../services/loading.service';
import { Attendance } from '../../../models/attendance.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-events-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events-view.component.html',
  styleUrls: ['./events-view.component.css']
})
export class EventsViewComponent implements OnInit {
  event: Event | null = null;
  loading = false;
  searchTerm = '';
  filteredAttendances: Attendance[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadEvent();
  }

  loadEvent() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (!eventId) {
      this.router.navigate(['/events']);
      return;
    }

    this.loadingService.show();
    this.eventService.getEvent(eventId).subscribe({
      next: (response: EventResponse) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            this.event = response.data[0];
            this.filteredAttendances = this.event.attendances || [];
          } else {
            this.router.navigate(['/events']);
          }
        } else {
          this.router.navigate(['/events']);
        }
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.loadingService.hide();
        this.router.navigate(['/events']);
      }
    });
  }

  filterAttendances() {
    if (!this.event?.attendances) return;
    
    const searchLower = this.searchTerm.toLowerCase();
    this.filteredAttendances = this.event.attendances.filter(attendance => 
      attendance.affiliate.fullName.toLowerCase().includes(searchLower) ||
      attendance.affiliate.externalId.toLowerCase().includes(searchLower)
    );
  }

  onEdit(): void {
    if (this.event) {
      this.router.navigate(['/events/edit', this.event._id]);
    }
  }

  onReport(): void {
    if (this.event) {
      this.router.navigate(['/events', this.event._id, 'report']);
    }
  }

  onPrint(): void {
    if (!this.event) return;

    const elementToPrint = document.getElementById('printableArea');
    if (!elementToPrint) {
      console.error('Element with ID "printableArea" not found.');
      return;
    }

    this.loadingService.show();

    // Add class to expand list before capturing
    elementToPrint.classList.add('printing-mode');

    // Use setTimeout to allow DOM update before canvas generation
    setTimeout(() => {
      html2canvas(elementToPrint, {
        scale: 2,
        useCORS: true, // Might help with images/icons if they are external
        // Allow Taint could be another option but less secure
        backgroundColor: '#ffffff' // Set background to white explicitly
      }).then((canvas) => {
        // Remove class immediately after capture
        elementToPrint.classList.remove('printing-mode');

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const safeEventName = this.event?.name.replace(/[^a-zA-Z0-9]/g, '_') || 'evento';
        
        // --- New download method --- 
        // Instead of pdf.save(), generate data URI
        // const pdfDataUri = pdf.output('datauristring'); // Old method
        
        // Generate Blob from PDF output
        const pdfBlob = pdf.output('blob');

        // Create a Blob URL
        const blobUrl = URL.createObjectURL(pdfBlob);

        // Create a temporary link element
        const link = document.createElement('a');
        // link.href = pdfDataUri; // Old method
        link.href = blobUrl; // Use Blob URL
        link.download = `${safeEventName}.pdf`;

        // Append link to body, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke the Blob URL to free up resources
        URL.revokeObjectURL(blobUrl);
        // --- End of new download method ---

        this.loadingService.hide(); // Hide loader
      }).catch(err => {
        // Ensure class is removed even if there is an error
        elementToPrint.classList.remove('printing-mode');
        console.error('Error generating PDF:', err);
        this.loadingService.hide(); // Hide loader in case of error
      });
    }, 0); // setTimeout with 0ms delay
  }

  onBack() {
    this.router.navigate(['/events']);
  }
} 