import { at } from '../../framework';
import { HomePage } from '../../pages/home.page';

describe('Cookie Consent', () => {
  describe('starting at home page', () => {
    before(() => {
      HomePage.navigateTo();
    });

    it('should see cookie banner', () => {
      at(HomePage, () => {
        cy.get('.cookie-banner').should('contain', 'Your privacy is important for us');
      });
    });

    it('should accept all cookies', () => {
      at(HomePage, () => {
        cy.getCookies().then(cookies => {
          expect(cookies[cookies.length - 1]).not.to.have.property('name', 'cookie-consent');
        });

        cy.get('.cookie-banner .btn.btn-light').click();
        cy.wait(3000);

        cy.getCookies().then(cookies => {
          expect(cookies[cookies.length - 1]).to.have.property('name', 'cookie-consent');
        });
      });
    });

    it('should manage cookies', () => {
      at(HomePage, page => {
        page.footer.manageCookies();
        cy.get('.cookie-consent-modal').should(
          'contain',
          'These cookies are necessary to provide you with services available through our website and to enable you to use certain features of our shop.'
        );
      });
    });
  });
});
