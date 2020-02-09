import { html, fixture, expect } from '@open-wc/testing';

import '../wc-autocomplete.js';

describe('WcAutocomplete', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture(html`
      <wc-autocomplete></wc-autocomplete>
    `);

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture(html`
      <wc-autocomplete></wc-autocomplete>
    `);
    el.shadowRoot.querySelector('button').click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture(html`
      <wc-autocomplete title="attribute title"></wc-autocomplete>
    `);

    expect(el.title).to.equal('attribute title');
  });

  it('shows initially the text "hey there Nr. 5!" and an "increment" button', async () => {
    const el = await fixture(html`
      <wc-autocomplete></wc-autocomplete>
    `);

    expect(el).shadowDom.to.equalSnapshot();
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`
      <wc-autocomplete></wc-autocomplete>
    `);

    await expect(el).shadowDom.to.be.accessible();
  });
});
