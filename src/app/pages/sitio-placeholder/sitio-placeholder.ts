import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-sitio-placeholder',
  imports: [RouterLink],
  templateUrl: './sitio-placeholder.html',
  styleUrl: './sitio-placeholder.css',
})
export class SitioPlaceholder {
  private readonly route = inject(ActivatedRoute);

  readonly title = toSignal(this.route.data.pipe(map((d) => (d['title'] as string) ?? 'Sección')), {
    initialValue: (this.route.snapshot.data['title'] as string) ?? 'Sección',
  });
}
