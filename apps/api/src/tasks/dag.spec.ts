import { DAG } from './dag';

describe('DAG', () => {
  // ASCII task dependencies representation:
  /*
           A  
          ↙ ↘  
         B    C  
          ↘ ↙  
           D  
           ↓  
           E  
  */

  const dag = new DAG();
  dag.addDependency('B', 'A'); // A depends on B
  dag.addDependency('C', 'A'); // A depends on C
  dag.addDependency('D', 'B'); // B depends on D
  dag.addDependency('D', 'C'); // C depends on D
  dag.addDependency('E', 'D'); // D depends on E

  it('should return topological sort', () => {
    // act
    const result = dag.topologicalSort();
    // assert
    expect(Array.from(result)).toStrictEqual(['E', 'D', 'C', 'B', 'A']);
  });

  it('should return topological sort from starting node', () => {
    // act
    const result = dag.topologicalSortFrom('C');
    // assert
    expect(Array.from(result)).toStrictEqual(['E', 'D', 'C']);
  });

  it('should return dependant (parent) tasks', () => {
    // act
    const result = dag.getAllDependents('E');
    // assert
    expect(Array.from(result)).toStrictEqual(['D', 'C', 'A', 'B']);
  });

  it('should return dependencies from starting node', () => {
    // act
    const result = dag.getAllDependencies('D');
    // assert
    expect(Array.from(result)).toStrictEqual(['E']);
  });
});
