import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

const material = [
  MatToolbarModule, 
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule
];

@NgModule({
  exports: [material],
  imports: [material]
})
export class MaterialModule { }