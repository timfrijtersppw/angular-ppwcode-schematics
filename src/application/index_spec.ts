import {SchematicTestRunner, UnitTestTree} from "@angular-devkit/schematics/testing";
import {ApplicationOptions} from "./index";

describe('Application Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    'ppwcode-angular-schematics',
    require.resolve('../collection.json'),
  );

  const workspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  const defaultOptions: ApplicationOptions = {
    name: 'foo',
    routing: undefined,
    style: undefined,
  };

  let workspaceTree: UnitTestTree;
  beforeEach(async () => {
    workspaceTree = await schematicRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
  });

  it('should set and handle routing', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree)
      .toPromise();
    const files = tree.files;
    expect(files).toContain('/projects/foo/src/app/app-routing.module.ts');
  });

  it('should set and handle style scss', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree)
      .toPromise();
    const files = tree.files;
    expect(files).toContain('/projects/foo/src/app/app.component.scss');
  });

  it('should remove project style setting', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree)
      .toPromise();
    const config = JSON.parse(tree.readContent('/angular.json'));
    const schematics = config.projects.foo.schematics;
    expect(schematics).toBeDefined();
    if (schematics["@schematics/angular:component"] !== undefined) {
      expect(schematics["@schematics/angular:component"].style).not.toBeDefined();
    }
  });

  it('should set build options', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree)
      .toPromise();
    const config = JSON.parse(tree.readContent('/angular.json'));
    const prj = config.projects.foo;
    const buildOpt = prj.architect.build.options;
    expect(buildOpt.buildOptimizer).toBeTrue();
    expect(buildOpt.extractCss).toBeTrue();
    expect(buildOpt.extractLicenses).toBeTrue();
    expect(buildOpt.optimization).toBeTrue();
    expect(buildOpt.statsJson).toBeTrue();
    expect(buildOpt.outputPath).toEqual('dist');
  });

  it('should copy budgets', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree)
      .toPromise();
    const config = JSON.parse(tree.readContent('/angular.json'));
    const prj = config.projects.foo;
    const buildOpt = prj.architect.build.options;
    expect(buildOpt.budgets).toBeDefined();
  });

  it('should configure build configurations', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematicAsync('application', options, workspaceTree)
      .toPromise();
    const config = JSON.parse(tree.readContent('/angular.json'));
    const prj = config.projects.foo;
    const configurations = prj.architect.build.configurations;
    expect(configurations.production).not.toBeDefined();
    expect(Object.getOwnPropertyNames(configurations).length).toEqual(1);
    expect(configurations.serve).toBeDefined();
    expect(configurations.serve.aot).toBeFalse();
    expect(configurations.serve.buildOptimizer).toBeFalse();
    expect(configurations.serve.optimization).toBeFalse();
    expect(configurations.serve.extractLicenses).toBeFalse();
    expect(configurations.serve.statsJson).toBeFalse();
    expect(configurations.serve.fileReplacements[0].replace).toEqual('src/environments/environment.ts');
    expect(configurations.serve.fileReplacements[0].with).toEqual('src/environments/environment.development.ts');
  });

});
