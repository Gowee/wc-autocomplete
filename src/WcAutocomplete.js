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
      placeholder: { reflect: true }
    };
  }

  constructor() {
    super();
    this.candidates = [];
    this.completer = (content) => [];
    this.pendingCompleterController = null;
  }

  async handleChange(e) {
    const content = e.target.value;
    if (this.pendingCompleterController !== null) {
      this.pendingCompleterController.abort();
    }
    const controller = new AbortController();
    this.pendingCompleterController = controller;
    try {
      this.candidates = await this.completer(content, controller.signal);
    }
    catch (e) {
      if (!(e instanceof DOMError && e.name === "AbortError")) {
        throw e;
      }
    }
    e.target.focus();
  }

  render() {
    return html`
      <input part="input" list="candidates" type="text" @input=${this.handleChange} placeholder=${this.placeholder} autocomplete="off" />
      <datalist part="candidates" id="candidates">
        ${this.candidates.map((item) => html`<option value="${item}" />`)}
      </datalist>
    `;
  }
}
