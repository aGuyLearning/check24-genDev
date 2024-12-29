import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { StreamingPackageInfo } from '../../../models/data_interfaces';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-package-dialog',
  standalone: true,
  imports: [JsonPipe, MatDialogModule, MatButtonModule],
  templateUrl: './package-dialog.component.html',
  styleUrl: './package-dialog.component.css',
})
export class PackageDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PackageDialogComponent>);
  readonly data = inject<{ packageInfo: StreamingPackageInfo, packageName: string }>(MAT_DIALOG_DATA);
  packageInfo = this.data.packageInfo;
  packageName = this.data.packageName;

}
