import { Injectable } from '@angular/core';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class CostCenterService {

  constructor(private snackbarService: SnackbarService) {}

  /**
   * Validates whether cost center form has unsaved data.
   * If user has entered/edited fields but not clicked Add, return false.
   */
  validateUnsavedCostCenter(costCenterComponentRef: any): boolean {
    if (!costCenterComponentRef) return true;
    const multipleCostCenterEnabled = costCenterComponentRef.costCenterForm.get('IsBillRaisedInMultipleCostCenter').value;
    const lineWiseRef = costCenterComponentRef.getLineWiseCostCenterRef();
    const form = lineWiseRef.costCenterDetailsForm;

    // Only validate if multiple cost centers are enabled
    if (multipleCostCenterEnabled && form?.dirty) {
      this.snackbarService.error(
        'Please click "Add" or "Clear" to save or discard cost center details before submitting the expense.',
        5000
      );

      // Optional: scroll to the cost center section for user clarity
      document
        .querySelector('#costCenterSection')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      return false; // Stop submission
    }

    return true; // Safe to continue
  }
}
