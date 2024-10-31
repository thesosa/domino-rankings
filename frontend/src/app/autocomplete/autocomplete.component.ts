import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-autocomplete',
  templateUrl: 'autocomplete.component.html',
  styleUrls: ['autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => AutocompleteComponent),
    },
  ],
})
export class AutocompleteComponent implements ControlValueAccessor {
  @Input() items: string[] = [];
  @Input() formControlName = '';
  value = '';
  itemsToShow: string[] = [];
  currentFocus = -1;

  onChange: Function = () => {};
  onTouched: Function = () => {};
  isDisabled = false;

  constructor() {}

  writeValue(obj: string): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onKeyDown(event: KeyboardEvent): void {
    this.onTouched();
    if (event.key === 'ArrowDown') {
      this.currentFocus =
        this.currentFocus < this.itemsToShow.length - 1
          ? ++this.currentFocus
          : this.currentFocus;
    } else if (event.key === 'ArrowUp') {
      this.currentFocus =
        this.currentFocus > 0 ? --this.currentFocus : this.currentFocus;
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.currentFocus > -1) {
        this.onItemSelect(this.itemsToShow[this.currentFocus]);
      }
    } else if (event.key === 'Tab' || event.key === 'Escape') {
      this.itemsToShow = [];
    }
  }

  onInput($event: Event): void {
    const inputValue = ($event.target as HTMLInputElement).value;
    this.onChange(inputValue);
    this.currentFocus = -1;
    if (inputValue.length === 0) {
      this.itemsToShow = [];
    } else {
      this.itemsToShow = this.items.filter((item) =>
        item.toLowerCase().startsWith(inputValue.toLowerCase())
      );
    }
  }

  onItemSelect(item: string): void {
    this.value = item;
    this.onChange(item);
    this.itemsToShow = [];
  }
}
