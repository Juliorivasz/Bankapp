import React, { useState, useEffect } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onValueChange: (value: string) => void;
  currencySymbol?: string;
}

export function CurrencyInput({ value, onValueChange, className, currencySymbol = '$', ...props }: CurrencyInputProps) {
  // Función para formatear el valor visualmente
  const formatDisplayValue = (val: string | number) => {
    if (!val) return '';
    
    // Convertir a string y limpiar caracteres no numéricos excepto punto/coma inicial
    const stringVal = val.toString();
    
    // Separar parte entera y decimal
    const parts = stringVal.split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1].substring(0, 2) : '';

    // Añadir separadores de miles
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return integerPart + decimalPart;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Obtener valor y limpiar todo lo que no sea número o punto decimal
    let inputValue = e.target.value.replace(/[^0-9.]/g, ''); // Permitir solo números y punto (para decimal)
    
    // Hack para permitir borrar todo
    if (inputValue === '') {
      onValueChange('');
      return;
    }

    // Gestionar múltiples puntos (solo el primero cuenta)
    const distinctParts = inputValue.split('.');
    if (distinctParts.length > 2) {
       inputValue = distinctParts[0] + '.' + distinctParts.slice(1).join('');
    }

    // Si el usuario escribe una coma, asumimos que quiere decimales -> reemplazar por punto
    // (Ya filtrado arriba, pero por si acaso cambiamos la lógica del replace)
    
    onValueChange(inputValue);
  };
  
  // Manejo especial para cuando el usuario escribe coma en vez de punto (común en teclado numérico ES)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === ',') {
          e.preventDefault();
          // Simular inserción de punto si no existe ya
          const currentVal = (e.target as HTMLInputElement).value;
          if (!currentVal.includes('.')) {
              onValueChange(value + '.');
          }
      }
  };

  // El valor que mostramos al usuario (Formateado con separadores de miles)
  // Pero ojo: El input type="text" permite escribir cualquier cosa.
  // Estrategia: 
  // 1. El usuario tiene `value` (raw: 10000.50)
  // 2. Mostramos `format(value)` -> 10.000.50
  // 3. Al cambiar, desformateamos -> quitamos puntos de miles -> guardamos raw
  
  const displayValue = formatDisplayValue(value);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={(e) => {
          // Desformatear: Quitar puntos de miles (pero dejar punto decimal)
          // Asumimos formato visual: 1.000,00 o 1.000.00 
          // Mi lógica de formatDisplay usa '.' para miles y '.' para decimales??? NO.
          // Conflicto: Si uso '.' para miles y '.' para decimales es ambiguo.
          // Estándar AR/ES: Miles='.', Decimal=','
          // Estándar US: Miles=',', Decimal='.'
          
          // RE-PENSANDO LA LOGICA PARA EVITAR AMBIGUEDAD
          // Input: Usuario ve 10.000,50
          // Escribe un 5 -> 10.000,505
          // Value Raw: 10000.505
          
          let val = e.target.value;
          
          // Estandarizar: Reemplazar comas por puntos par cálculos (si usáramos lógica interna)
          // Pero para display:
          // Si el usuario borra un punto de mil -> no pasa nada, se re-agrega solo
          
          // Limpiar separadores de miles (.)
          let raw = val.replace(/\./g, '');
          
          // Reemplazar coma decimal por punto para guardarlo como float standard
          raw = raw.replace(/,/g, '.');
          
          // Validar que sea numero valido
          if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
              onValueChange(raw);
          }
      }}
      onKeyDown={(e) => {
          if (e.key === '.') {
              e.preventDefault();
              const currentVal = value.toString();
              if (!currentVal.includes('.')) {
                  onValueChange(currentVal + '.');
              }
          }
      }}
      className={className}
      {...props}
    />
  );
}

// Re-escritura con lógica más robusta
/* 
   Intentaremos un enfoque "masked" simple.
   Display: 1.234,56 (AR/ES)
   Internal: 1234.56
*/
export const FormattedAmountInput = ({ value, onChange, className, ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & { value: string, onChange: (val: string) => void, className?: string }) => {
    
    // Parsear el valor raw para mostrarlo
    const formatValue = (val: string) => {
        if (!val) return '';
        const parts = val.split('.');
        const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Puntos para miles
        const decPart = parts.length > 1 ? ',' + parts[1] : ''; // Coma para decimales
        return intPart + decPart;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        // Limpiar: Eliminar puntos (miles)
        let raw = inputValue.replace(/\./g, '');
        
        // Convertir coma decimal a punto (para el estado interno)
        raw = raw.replace(/,/g, '.');

        // Permitir solo dígitos y un solo punto
        if (/^\d*\.?\d*$/.test(raw)) {
             onChange(raw);
        }
    };

    return (
        <input
            {...props}
            type="text"
            inputMode="decimal"
            value={formatValue(value)}
            onChange={handleChange}
            className={className}
        />
    );
};
