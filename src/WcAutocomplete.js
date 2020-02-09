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
        padding-bottom: calc(.5em - 1px);
        padding-left: calc(.75em - 1px);
        padding-right: calc(.75em - 1px);
        padding-top: calc(.5em - 1px);
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
      placeholder: { type: String, reflect: true },
      value: { type: String, reflect: true },
      disabled: { type: Boolean, reflect: true },
      autofocus: { type: Boolean, reflect: true }
    };
  }

  constructor() {
    super();
    this.candidates = [];
    this.completer = (content) => [];
    this.pendingCompleterController = null;
    this.value = "";
    this.disabled = false;
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
  }

  createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  async handleInput(e) {
    const input = e.target.value;
    this.value = input;
    if (this.pendingCompleterController !== null) {
      this.pendingCompleterController.abort();
    }
    const controller = new AbortController();
    this.pendingCompleterController = controller;
    try {
      this.candidates = await this.completer(input, controller.signal);
    }
    catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        throw e;
      }
    }
    this.pendingCompleterController = null;
    e.target.focus();
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

  focus() {
    console.log(this.shadowRoot.querySelector);
    this.shadowRoot.querySelector("input").focus();
  }

  blur() {
    this.shadowRoot.querySelector("input").blur();
  }

  render() {
    return html`
      <input
        part="input"
        list="candidates"
        type="text"
        @input=${this.handleInput}
        placeholder=${this.placeholder}
        value=${this.value}
        ?disabled=${this.disabled}
        autocomplete="off" />
      <datalist part="candidates" id="candidates">
        ${this.candidates.map((item) => html`<option value="${item}" />`)}
      </datalist>
    `;
  }
}
