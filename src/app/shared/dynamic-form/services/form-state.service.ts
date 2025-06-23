import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { IFormControl } from '../form-control.interface';

export interface IFormState {
  form: FormGroup;
  formControls: { formConfig: IFormControl, control: FormControl }[];
  tableData: any[];
  selectedRow: any;
  formData: any;
  editIndex: number;
  isValid: boolean;
  selectedFiles: any[];
}

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private state = new BehaviorSubject<IFormState>({
    form: new FormGroup({}),
    formControls: [],
    tableData: [],
    selectedRow: null,
    formData: {},
    editIndex: 0,
    isValid: true,
    selectedFiles: []
  });

  // Get current state
  getState(): Observable<IFormState> {
    return this.state.asObservable();
  }

  // Get current state value
  getCurrentState(): IFormState {
    return this.state.value;
  }

  // Update state partially
  updateState(partialState: Partial<IFormState>): void {
    this.state.next({
      ...this.state.value,
      ...partialState
    });
  }

  // Helper methods that maintain existing functionality
  updateForm(form: FormGroup): void {
    this.updateState({ form });
  }

  updateFormControls(formControls: { formConfig: IFormControl, control: FormControl }[]): void {
    this.updateState({ formControls });
  }

  updateTableData(tableData: any[]): void {
    this.updateState({ tableData });
  }

  updateSelectedRow(selectedRow: any): void {
    this.updateState({ selectedRow });
  }

  updateFormData(formData: any): void {
    this.updateState({ formData });
  }

  updateEditIndex(editIndex: number): void {
    this.updateState({ editIndex });
  }

  updateIsValid(isValid: boolean): void {
    this.updateState({ isValid });
  }

  updateSelectedFiles(selectedFiles: any[]): void {
    this.updateState({ selectedFiles });
  }

  // Reset state to initial values
  resetState(): void {
    this.state.next({
      form: new FormGroup({}),
      formControls: [],
      tableData: [],
      selectedRow: null,
      formData: {},
      editIndex: 0,
      isValid: true,
      selectedFiles: []
    });
  }
} 