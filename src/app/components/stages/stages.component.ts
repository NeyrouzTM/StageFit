import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StageService } from '../../services/stage.service';
import { Stage } from '../../model/stage';
import { AuthService } from '../../services/auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { StageFiltersComponent, StageFilterCriteria } from '../stage-filters/stage-filters.component';

@Component({
  selector: 'app-stages',
  standalone: true,
  imports: [CommonModule, RouterModule, StageFiltersComponent],
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.css']
})
export class StagesComponent implements OnInit {

  stages: Stage[] = [];
  allStages: Stage[] = [];
  filters: StageFilterCriteria = {};

  constructor(private stageService: StageService, private auth: AuthService, private favs: FavoritesService) {}

  ngOnInit(): void {
    this.loadStages();
    
    // S'abonner aux notifications d'ajout de stage
    this.stageService.stageAdded$.subscribe(() => {
      this.loadStages();
    });
  }

  loadStages(): void {
    this.stageService.getStages().subscribe({
      next: (data) => {
        this.allStages = data;
        this.applyFilters(this.filters);
        console.log('Stages chargés:', this.stages);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stages:', err);
      }
    });
  }

  get isRecruiter(): boolean {
    return this.auth.isRecruiter();
  }

  onFiltersChange(criteria: StageFilterCriteria): void {
    this.filters = criteria;
    this.applyFilters(criteria);
  }

  private applyFilters(c: StageFilterCriteria): void {
    const favSet = new Set(this.favs.list());
    const matches = (s: Stage): boolean => {
      if (c.availableOnly && !s.disponible) return false;
      if (c.mode && c.mode !== 'any' && s.mode && s.mode !== c.mode) return false;
      if (c.domain && (s.domain || '').toLowerCase().indexOf(c.domain) === -1) return false;
      if (c.location && (s.location || '').toLowerCase().indexOf(c.location) === -1) return false;
      const exp = s.minExperienceYears ?? 0;
      if ((c.minExperienceYears || 0) > exp) return false;
      if (c.requiredSkill) {
        const req = (s.requiredSkills || []).map((x) => x.toLowerCase());
        if (!req.some((x) => x.includes(c.requiredSkill!))) return false;
      }
      if (c.search) {
        const blob = `${s.titre} ${s.entreprise} ${s.description}`.toLowerCase();
        if (!blob.includes(c.search)) return false;
      }
      if (c.onlyFavorites && !favSet.has(s.ref)) return false;
      return true;
    };
    this.stages = this.allStages.filter(matches);
  }

  isFavorite(ref: number): boolean { return this.favs.isFavorite(ref); }
  toggleFavorite(ref: number): void {
    this.favs.toggle(ref);
    // re-apply filters in case "onlyFavorites" is active
    this.applyFilters(this.filters);
  }

  exportCsv(): void {
    const headers = ['ref','titre','entreprise','description','location','mode','domain','minExperienceYears','disponible','nbrInteresse'];
    const rows = this.stages.map(s => [
      s.ref,
      escapeCsv(s.titre),
      escapeCsv(s.entreprise),
      escapeCsv(s.description),
      escapeCsv(s.location || ''),
      s.mode || '',
      escapeCsv(s.domain || ''),
      s.minExperienceYears ?? 0,
      s.disponible ? 'oui' : 'non',
      s.nbrInteresse
    ].join(','));
    const content = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'stages.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    function escapeCsv(v: any): string {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }
  }
}
