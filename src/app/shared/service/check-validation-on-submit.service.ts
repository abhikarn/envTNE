import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CheckValidationOnSubmitService {

  constructor() { }

  duplicateLineItems(checkValidationOnSubmit: any, existingData: any[], form: any, editIndex: number) {
    const duplicateField = checkValidationOnSubmit?.duplicateEntry?.duplicateField;
    const checkDuplicateField = form.value?.[duplicateField];

    if (!duplicateField || !existingData?.length) {
      return false;
    }

    for (let i = 0; i < existingData.length; i++) {
      if (i === (editIndex - 1)) continue;

      const data = existingData[i];
      if (data[duplicateField]?.value == checkDuplicateField) {
        return true;
      }
    }

    return false;
  }

}
