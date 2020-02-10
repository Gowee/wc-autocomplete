import { html, css, LitElement } from 'lit-element';

export class WcAutocomplete extends LitElement {
  static get styles() {
    return css`
      :host {
        --wc-autocomplete-text-color: #000;

        display: block;
        color: var(--wc-autocomplete-text-color);
      }

      input {
        line-height: 1.5;
        font-size: 1rem;
        padding-bottom: calc(0.5em - 1px);
        padding-left: calc(0.75em - 1px);
        padding-right: calc(0.75em - 1px);
        padding-top: calc(0.5em - 1px);
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1), height 0s;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
      }

      input:focus {
        border-color: #40a9ff;
      }
    `;
  }

  static get properties() {
    return {
      candidates: { type: Array[String] },
      title: { type: String, reflect: true },
      placeholder: { type: String, reflect: true },
      value: { type: String, reflect: true },
      disabled: { type: Boolean, reflect: true },
      autofocus: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.candidates = [];
    this.completer = _input => [];
    this.pendingCompleterController = null;
    this.value = '';
    this.title = '';
    this.placeholder = '';
    this.disabled = false;
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
  }

  createRenderRoot() {
    // Delegate focus so that the composed elements behaves as a whole
    return this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  async handleInput(e) {
    const input = e.target.value;
    this.value = input;

    // Signal the previous AbortController and replace it with a new one
    if (this.pendingCompleterController !== null) {
      this.pendingCompleterController.abort();
    }
    const controller = new AbortController();
    this.pendingCompleterController = controller;

    // Use the new AbortController to fetch autocomplete candidates
    try {
      this.candidates = await this.completer(input, controller.signal);
    } catch (err) {
      /* istanbul ignore next */
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        throw err;
      }
    } finally {
      this.pendingCompleterController = null;
    }
    // e.target.focus();
  }

  handleChange(_e) {
    // change event won't bubble out the Shadow DOM boundary; Ref:
    // https://developers.google.com/web/fundamentals/web-components/shadowdom#events
    this.dispatchEvent(new Event('change'));
  }

  firstUpdated(_changedProperties) {
    // _changedProperties.forEach((oldValue, propName) => {
    //   console.log(`${propName} changed. oldValue: ${oldValue}`);
    // });
    // TODO: How to make autofocus work automatically?
    if (this.autofocus) {
      this.focus();
    }
  }

  focus(options) {
    super.focus(options);
    this.shadowRoot.querySelector('input').focus();
  }

  blur(options) {
    super.blur(options);
    this.shadowRoot.querySelector('input').blur();
  }

  render() {
    return html`
      <input
        part="input"
        list="candidates"
        type="text"
        @input=${this.handleInput}
        @change=${this.handleChange}
        title=${this.title}
        placeholder=${this.placeholder}
        .value=${this.value}
        ?disabled=${this.disabled}
        autocomplete="off"
      />
      <datalist part="candidates" id="candidates">
        ${this.candidates.map(
          item =>
            html`
              <option value="${item}"> </option>
            `,
        )}
      </datalist>
    `;
  }
}
