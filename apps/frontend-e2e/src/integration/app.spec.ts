describe('frontend', () => {
  beforeEach(() => cy.visit('/'));

  it('should have app name displayed', () => {
    cy.get('.navbar-brand').should('contain', 'tskmgr');
  });
});
