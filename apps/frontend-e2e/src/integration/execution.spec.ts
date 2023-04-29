describe('execution', () => {
  it('should uniquely identify duplicated commands', () => {
    // arrange
    cy.intercept('/api/runs/587', { fixture: 'execution/details.json' });
    cy.intercept('/api/runs/587/tasks', { fixture: 'execution/tasks.json' });
    // act
    cy.visit('/runs/587/execution');
  });
});
