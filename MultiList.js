import { Component } from 'react'
import styled from 'styled-components'

class MultiList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: this.props.value || '',
      options: null,
      placeOptionsAbove: false
    }

    this.theme = this.props.theme || {
      background: 'white',
      dark: 'black',
      light: 'lightgrey',
    }

    if (!this.props.id || document.getElementById(this.props.id)) throw new Error('MultiList requires a unique id.')
  }

  componentDidMount() {
    this.inputElement = document.getElementById(this.props.id)
    this.resetScrollIndex()
    this.getInputDimensions()
    document.addEventListener('click', this.clickedOutsideOfContainer)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.clickedOutsideOfContainer)
  }

  resetScrollIndex = () => {
    this.scrollIndex = null
  }

  getInputDimensions = () => {
    this.inputElementHeight = this.inputElement.getBoundingClientRect().height
    this.inputElementWidth = this.inputElement.getBoundingClientRect().width
  }

  inputChangedHandler = event => {
    this.resetScrollIndex()
    this.getInputDimensions()
    this.calculateSpaceBeneathInput()
    let value = event.target.value.toLowerCase()
    if (this.keyCode === 188) value = this.commaHandler(value)
    if (this.keyCode === 32) value = this.spacebarHandler(value)
    this.setState({ value }, () => {
      this.calculateNextPhrase()
      this.resetScroll()
    })
  }

  calculateSpaceBeneathInput = () => {
    const yPosition = this.inputElement.getBoundingClientRect().y
    const availableSpace = window.innerHeight - yPosition - 80
    this.setState({ placeOptionsAbove: availableSpace < 100 ? true : false })
  }

  commaHandler = value => {
    if (value.trim() === ',') return ''
    if (!this.props.multiple) return value
    if (value.slice(value.length - 3) === ', ,') return value.slice(0, value.length - 1)
    return `${value} `
  }

  spacebarHandler = value => {
    if (value[value.length - 1] === ' ' && value.slice(value.length - 2) !== ', ')
      return value.slice(0, value.length - 1)
    return value
  }

  calculateNextPhrase = () => {
    const value = this.state.value
    this.nextPhrase = value.includes(',') ? value.slice(value.lastIndexOf(' ') + 1) : value
    this.populateOptions()
  }

  resetScroll = () => {
    const optionsDiv = document.getElementById(`${this.props.id}-options`)
    if (!optionsDiv) return
    optionsDiv.scrollTo(0, 0)
  }

  populateOptions = () => {
    if (!this.props.list || !this.nextPhrase) return
    this.availableOptions = []
    let options = this.props.list
      .sort()
      .filter(option => {
        const value = this.state.value
        if (value.includes(option) && value.includes(',') && value.lastIndexOf(',') > value.indexOf(option))
          return false
        return option.includes(this.nextPhrase)
      })
      .map((option, index) => {
        this.availableOptions.push(option)
        return (
          <Option
            key={option}
            id={option}
            index={index}
            focus={this.scrollIndex === index}
            onMouseOver={this.onMouseMovedOverOption}
            onMouseLeave={this.onMouseLeaveOption}
            onClick={this.optionClickedHandler}
            title={option}
            theme={this.theme}
          >
            <OptionText
              id={option}
              style={{ paddingLeft: '10px' }}
              onMouseOver={this.onMouseMovedOverOption}
              onClick={this.optionClickedHandler}
              theme={this.theme}
            >
              {option.slice(0, option.indexOf(this.nextPhrase))}
            </OptionText>
            <OptionText
              id={option}
              bold
              onMouseOver={this.onMouseMovedOverOption}
              onClick={this.optionClickedHandler}
              theme={this.theme}
            >
              {this.nextPhrase}
            </OptionText>
            <OptionText
              id={option}
              style={{ paddingLRight: '10px' }}
              onMouseOver={this.onMouseMovedOverOption}
              onClick={this.optionClickedHandler}
              theme={this.theme}
            >
              {option.slice(option.indexOf(this.nextPhrase) + this.nextPhrase.length)}
            </OptionText>
          </Option>
        )
      })

    this.setState({ options })
  }

  onMouseMovedOverOption = event => {
    if (this.focusedOption === event.target.id) return
    this.focusedOption = event.target.id
    this.scrollIndex = this.availableOptions.findIndex(option => option === this.focusedOption)
    this.populateOptions()
  }

  onMouseLeaveOption = () => {
    this.focusedOption = null
    this.scrollIndex = null
    this.populateOptions()
  }

  optionClickedHandler = event => {
    const clickedOption = event.target.id
    let value
    if (this.props.multiple) {
      value = this.state.value.includes(',')
        ? this.state.value.slice(0, this.state.value.lastIndexOf(', ') + 2).concat(clickedOption)
        : this.state.value.slice(this.nextPhrase.length).concat(clickedOption)
    } else value = clickedOption
    this.resetForNextItem()
    this.setState({ value }, () => {
      this.setCursorToEnd()
    })
  }

  resetForNextItem = () => {
    this.nextPhrase = ''
    this.focusedOption = null
    this.resetScrollIndex()
    this.setState({ options: null })
  }

  setCursorToEnd = () => {
    this.inputElement.focus()
    this.inputElement.scrollLeft = this.inputElement.scrollWidth
  }

  arrowDownHandler = event => {
    if (!this.state.options) return
    event.preventDefault()
    this.scrollDown()
  }

  scrollDown = () => {
    if (this.scrollIndex === null) this.scrollIndex = 0
    else if (this.scrollIndex < this.state.options.length - 1) this.scrollIndex++
    else this.scrollIndex = 0
    this.scrollToFocusedOption()
  }

  arrowUpHandler = event => {
    if (!this.state.options) return
    event.preventDefault()
    this.scrollUp()
  }

  scrollUp = () => {
    if (this.scrollIndex === null) this.scrollIndex = this.state.options.length - 1
    else if (this.scrollIndex > 0) this.scrollIndex--
    else this.scrollIndex = this.options.length - 1
    this.scrollToFocusedOption()
  }

  scrollToFocusedOption = () => {
    // scrollIntoView({block: 'nearest'}) would have been much simpler, but options for scrollIntoView() are not supported on safari
    if (this.scrollIndex === null) return
    this.focusedOption = this.availableOptions[this.scrollIndex]

    const optionsDiv = document.getElementById(`${this.props.id}-options`)
    if (!optionsDiv) return
    const optionsDivBottom = optionsDiv.getBoundingClientRect().bottom
    const optionsDivTop = optionsDiv.getBoundingClientRect().top

    const focusedOption = document.getElementById(this.focusedOption)
    if (!focusedOption) return
    const focusedOptionBottom = focusedOption.getBoundingClientRect().bottom
    const focusedOptionTop = focusedOption.getBoundingClientRect().top
    const focusedOptionHeight = focusedOption.getBoundingClientRect().height

    if (focusedOptionBottom > optionsDivBottom && focusedOptionBottom - optionsDivBottom < focusedOptionHeight)
      optionsDiv.scrollBy(0, focusedOptionHeight)
    if (focusedOptionTop < optionsDivTop && optionsDivTop - focusedOptionTop < focusedOptionHeight)
      optionsDiv.scrollBy(0, -focusedOptionHeight)
    if (this.scrollIndex === 0) optionsDiv.scrollTo(0, 0)
    if (this.scrollIndex === this.availableOptions.length - 1) focusedOption.scrollIntoView()

    this.populateOptions()
  }

  enterHandler = () => {
    if (this.nextPhrase === '' || !document.getElementById(`${this.props.id}-options`)) return false
    let value
    if (this.props.multiple) {
      value = this.state.value.includes(',')
        ? this.state.value
            .slice(0, this.state.value.lastIndexOf(', ') + 2)
            .concat(this.focusedOption || this.nextPhrase, ', ')
        : this.state.value.slice(this.nextPhrase.length).concat(this.focusedOption || this.nextPhrase, ', ')
    } else value = this.focusedOption || this.nextPhrase
    this.resetForNextItem()
    this.setState({ value }, () => {
      this.setCursorToEnd()
    })
  }

  onFocusHandler = event => {
    this.calculateSpaceBeneathInput()
    if (this.state.value.length > 1 && this.props.multiple) {
      const value = `${this.state.value}, `
      this.setState({ value }, () => {
        this.setCursorToEnd()
      })
    }
    if (this.props.onFocus) this.props.onFocus(event)
  }

  onBlurHandler = event => {
    let value = this.state.value
    if (value.slice(value.length - 2).trim() === ',') value = value.slice(0, value.lastIndexOf(','))
    if (value.trim() === ',') value = ''
    this.setState({ value }, () => {
      if (this.props.onBlur) this.props.onBlur(event)
    })
  }

  clickedOutsideOfContainer = event => {
    const clickedElement = event.target.id
    if (this.availableOptions && this.availableOptions.includes(clickedElement)) return
    if ([this.props.id, `${this.props.id}-container`, `${this.props.id}-options`].includes(clickedElement)) return
    this.setState({ options: null })
  }

  detectKeyPress = event => {
    this.keyCode = event.keyCode
    if (!this.nextPhrase) return
    if (this.keyCode === 40) this.arrowDownHandler(event)
    if (this.keyCode === 38) this.arrowUpHandler(event)
    if (this.keyCode === 13) this.enterHandler(event)
  }

  render() {
    return (
      <Container
        id={`${this.props.id}-container`}
        height={this.props.height}
        width={this.props.width}
        margin={this.props.margin}
        placeOptionsAbove={this.state.placeOptionsAbove}
      >
        <TextInput
          id={this.props.id}
          type='text'
          autoComplete='off'
          value={this.state.value}
          onChange={this.inputChangedHandler}
          onFocus={this.onFocusHandler}
          onBlur={this.onBlurHandler}
          onKeyDown={this.detectKeyPress}
          placeholder={this.state.placeholder}
          width={this.props.width}
          height={this.props.height}
          fontSize={this.props.fontSize}
          theme={this.theme}
        />
        {this.state.options && this.state.options.length > 0 && this.state.value !== '' ? (
          <Options
            id={`${this.props.id}-options`}
            inputWidth={`${this.inputElement.clientWidth}px`}
            placeOptionsAbove={this.state.placeOptionsAbove}
            inputElementHeight={this.inputElementHeight}
            theme={this.theme}
          >
            {this.state.options}
          </Options>
        ) : null}
      </Container>
    )
  }
}

const Container = styled.div`
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: ${props => (props.placeOptionsAbove ? 'column-reverse' : 'column')};
  justify-content: flex-start;
  overflow: visible;
  height: ${props => props.height || 'auto'};
  width: ${props => props.width || 'auto'};
  margin: ${props => props.margin || null};
`

const TextInput = styled.input`
  position: relative;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
  box-sizing: border-box;
  padding: 12px 10px;
  outline: none;
  border: 1px solid ${props => props.theme.dark};
  border-radius: 5px;
  background-color: ${props => props.theme.background};
  font-size: ${props => props.fontSize || '14px'};
  color: ${props => props.theme.dark};

  :focus {
    border: 2px solid ${props => props.theme.dark};
  }
`

const Options = styled.div`
  position: absolute;
  top: ${props => (props.placeOptionsAbove ? null : `${props.inputElementHeight}px`)};
  bottom: ${props => (props.placeOptionsAbove ? `${props.inputElementHeight - 1}px` : null)};
  width: ${props => props.inputWidth || 'auto'};
  height: auto;
  max-height: 200px;
  box-sizing: border-box;
  padding: 6px 0px;
  border: 1px solid ${props => props.theme.dark};
  background-color: ${props => props.theme.background};
  overflow-y: auto;
`

const Option = styled.div`
  width: 100%;
  height: 20px;
  background-color: ${props => (props.focus ? props.theme.light : props.theme.background)};
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (hover: hover) and (pointer: fine) {
    :hover {
      cursor: pointer;
    }
  }
`

const OptionText = styled.span`
  color: ${props => props.theme.dark};
  font-weight: ${props => (props.bold ? 'bold' : 'initial')};
  font-size: 14px;
`

export default MultiList
