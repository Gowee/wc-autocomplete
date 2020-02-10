import { html, fixture, expect, oneEvent } from '@open-wc/testing';

import '../wc-autocomplete.js';

describe('WcAutocomplete', () => {
  // it('has a default title "Hey there" and counter 5', async () => {
  //   const el = await fixture(html`
  //     <wc-autocomplete></wc-autocomplete>
  //   `);

  //   expect(el.title).to.equal('Hey there');
  //   expect(el.counter).to.equal(5);
  // });

  // it('increases the counter on button click', async () => {
  //   const el = await fixture(html`
  //     <wc-autocomplete></wc-autocomplete>
  //   `);
  //   el.shadowRoot.querySelector('button').click();

  //   expect(el.counter).to.equal(6);
  // });

  it('has reflected properties be empty when corresponding attributes are unset', async () => {
    const el = await fixture(html`
      <wc-autocomplete></wc-autocomplete>
    `);
    // instead of undefined
    expect(el.title).to.equal('');
    expect(el.placeholder).to.equal('');
    expect(el.value).to.equal('');
  });

  it('can override the title, placeholder via attribute', async () => {
    const el = await fixture(html`
      <wc-autocomplete title="attribute title" placeholder="placeholder!"></wc-autocomplete>
    `);

    expect(el.title).to.equal('attribute title');
    expect(el.placeholder).to.equal('placeholder!');
  });

  it('can set disabled state via attribute', async () => {
    {
      const el = await fixture(html`
        <wc-autocomplete disabled></wc-autocomplete>
      `);
      expect(el.disabled).true;
      const input = el.shadowRoot.querySelector('input');
      expect(input.disabled).true;
    }
    {
      const el = await fixture(html`
        <wc-autocomplete></wc-autocomplete>
      `);
      expect(el.disabled).false;
      const input = el.shadowRoot.querySelector('input');
      expect(input.disabled).false;
    }
  });

  it('can reflect value', async () => {
    const el = await fixture(html`
      <wc-autocomplete value="initial value"></wc-autocomplete>
    `);
    const input = el.shadowRoot.querySelector('input');
    expect(el.value).to.equal('initial value');
    expect(input.value).to.equal('initial value');
    input.value = 'value!';
    input.dispatchEvent(new Event('input'));
    expect(el.value).to.equal('value!');
  });

  it('can complete', async () => {
    const completer = (input, _signal) => [input, input + input, input + input + input];
    const el = await fixture(html`
      <wc-autocomplete .completer=${completer}></wc-autocomplete>
    `);
    const input = el.shadowRoot.querySelector('input');
    const datalist = el.shadowRoot.querySelector('datalist');

    input.value = 'test';
    await el.handleInput.bind(el)({ target: input });
    expect(el.value).to.equal('test');
    expect(datalist).to.equalSnapshot();

    // to increase branch coverage
    el.pendingCompleterController = new AbortController();

    input.value = 'oOo';
    await el.handleInput.bind(el)({ target: input });
    expect(el.value).to.equal('oOo');
    const completions = completer('oOo');
    expect(datalist.querySelector(':nth-child(1)').value).to.equal(completions[0]);
    expect(datalist.querySelector(':nth-child(2)').value).to.equal(completions[1]);
    expect(datalist.querySelector(':nth-child(3)').value).to.equal(completions[2]);
  });

  it('can focus and blur', async () => {
    const el = await fixture(html`
      <wc-autocomplete></wc-autocomplete>
    `);
    const input = el.shadowRoot.querySelector('input');
    expect(document.hasFocus()).false;
    el.focus();
    expect(el.shadowRoot.activeElement).to.equal(input);
    expect(document.hasFocus()).true;
    el.blur();
    expect(el.shadowRoot.activeElement).to.not.equal(input);
  });

  it('can delegate focus', async () => {
    const el = await fixture(html`
      <wc-autocomplete></wc-autocomplete>
    `);
    el.focus();
    expect(document.activeElement).to.equal(el);
    expect(document.hasFocus()).true;
  });

  it('can autofocus', async () => {
    const el = await fixture(html`
      <wc-autocomplete autofocus></wc-autocomplete>
    `);
    expect(document.activeElement).to.equal(el);
    expect(document.hasFocus()).true;
  });

  it('throws change event normally', async () => {
    const el = await fixture(html`
      <wc-autocomplete></wc-autocomplete>
    `);
    const listener = oneEvent(el, 'change');
    const input = el.shadowRoot.querySelector('input');
    input.value = 'value!';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('change'));
    const { target } = await listener;
    expect(target.value).to.equal('value!');
  });

  // it('shows initially the text "hey there Nr. 5!" and an "increment" button', async () => {
  //   const el = await fixture(html`
  //     <wc-autocomplete></wc-autocomplete>
  //   `);

  //   expect(el).shadowDom.to.equalSnapshot();
  // });

  // it('passes the a11y audit', async () => {
  //   const el = await fixture(html`
  //     <wc-autocomplete></wc-autocomplete>
  //   `);

  //   await expect(el).shadowDom.to.be.accessible();
  // });
});
