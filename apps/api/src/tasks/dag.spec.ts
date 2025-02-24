import { DAG } from './dag';

describe('DAG', () => {
  const dag = new DAG();
  dag.addDependency('B', 'A'); // A depends on B
  dag.addDependency('C', 'A'); // A depends on C
  dag.addDependency('D', 'B'); // B depends on D
  dag.addDependency('D', 'C'); // C depends on D
  dag.addDependency('E', 'D'); // D depends on E

  it('simple test', () => {
    console.log(dag.topologicalSort());
  });

  it('simple test 2', () => {
    console.log(dag.topologicalSortFrom('E'));
  });

  it('simple test 3', () => {
    console.log(dag.topologicalSortFrom('A'));
  });

  it('simple test 4', () => {
    console.log(dag.topologicalSortFrom('C'));
  });

  it('simple test 5', () => {
    console.log(dag.getAllDependents('D'));
  });
});
