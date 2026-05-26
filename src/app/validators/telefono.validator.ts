import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

const SOLO_DIGITOS = /^\d+$/;

export function soloNumerosValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    return SOLO_DIGITOS.test(String(valor)) ? null : { soloNumeros: true };
  };
}

export const telefonoValidators = [
  Validators.required,
  Validators.maxLength(10),
  soloNumerosValidator(),
];

export const TELEFONO_AYUDA_MSG = 'Hasta 10 dígitos numéricos, sin espacios ni guiones.';
