import { Injectable } from '@angular/core';

const KEY = 'favorite_stage_refs';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private set = new Set<number>(this.load());

  toggle(ref: number): void {
    if (this.set.has(ref)) this.set.delete(ref); else this.set.add(ref);
    this.persist();
  }

  isFavorite(ref: number): boolean { return this.set.has(ref); }

  list(): number[] { return Array.from(this.set.values()); }

  private load(): number[] {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  }

  private persist(): void { localStorage.setItem(KEY, JSON.stringify(this.list())); }
}
