# multilist
A React datalist input with optional 'multiple' flag that allows for the selection of more than one item. The multilist is loosely based on Google's search bar. It can serve as a replacement for the standard <datalist> element when two or more options are expected to be selected.


Dependencies:
  React, styled-components


Parameters:
  
  REQUIRED:
    id [string: required]
     A unique id for the input element.

    list [array of strings: required]
      This is the list of words that will be available for selection. Similar to <option> elements for a datalist.
  
  OPTIONAL:
    multiple [boolean: optional]
      If multiple is set, more than one word can be chosen.

    onFocus [function: optional]
      Function to be called when element is focused.

    onBlur [function: optional]
      Function to be called when element is blurred.
    
    theme [object: optional]
      Object with three colour values for background, dark and light.
    
    height [string: optional]
      CSS-formatted string to specify element height.

    width [string: optional]
      CSS-formatted string to specify element width.

    margin [string: optional]
      CSS-formatted string to specify element margin.

    fontSize [string: optional]
      CSS-formatted string to specify element font-size.
