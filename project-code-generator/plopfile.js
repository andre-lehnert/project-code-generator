const fs = require('fs');

function makeDir(implBusinessLogicBasePath) {
  if (!fs.existsSync(implBusinessLogicBasePath)) {
    fs.mkdirSync(implBusinessLogicBasePath);
  }
}
function renderFile({answers, plop}, templatePath, basePath, fileNameSuffix) {
  const fileName = answers.componentName + fileNameSuffix;
  const dataObjectTargetPath = [basePath, fileName].join('/');

  let dataObjectContent = fs.readFileSync(templatePath, "utf8");
  dataObjectContent = plop.renderString(dataObjectContent, answers);
  fs.writeFileSync(dataObjectTargetPath, dataObjectContent);
}

module.exports = function (plop) {
  plop.setActionType('list bypass parameters', function (answers) {
    let parameters = '';
    Object.keys(answers).forEach(answer => parameters += '--' + answer + ' ' + answers[answer] + ' ');

    return `:
    
${parameters}

`;
  });

  const defaultActions = [
    {
      type: 'list bypass parameters'
    },
  ];
  const defaultPrompts = [
    {
      type: 'input',
      name: 'componentPath',
      message: 'Enter the target maven src folder path, e.g. "/user/project/src/main/java"'
    },
    {
      type: 'input',
      name: 'componentPackage',
      message: 'Enter the packageName, e.g. "com.mycompany.app.components"'
    },
    {
      type: 'input',
      name: 'componentName',
      message: 'Enter the componentName, e.g. "Recipient", "User"',
      default: 'My'
    },
  ];
  const createSpringComponent =  {
    type: 'createComponent',
    componentInterfaceTemplate: './templates/spring/component-interface.hbs',
    componentFacadeTemplate: './templates/spring/component-facade.hbs',
    componentBusinessLogicTemplate: './templates/spring/component-business-logic.hbs',
    componentDataObjectTemplate: './templates/spring/component-data-object.hbs',
    componentDataObjectMapperTemplate: './templates/spring/component-data-object-mapper.hbs',
    componentEntityTemplate: './templates/spring/component-entity.hbs',
    componentRepositoryTemplate: './templates/spring/component-repository.hbs',

    resourceTemplate: './templates/spring-resource/crud-resource.hbs',
    resourceTransferObjectTemplate: './templates/spring-resource/resource-transfer-object.hbs',
    resourceTransferObjectMapperTemplate: './templates/spring-resource/resource-transfer-object-mapper.hbs',
    resourceCompositeTransferObjectTemplate: './templates/spring-resource/resource-composite-transfer-object.hbs',
  };

  const createSpringResource =  {
    type: 'createComponent',
    resourceTemplate: './templates/spring-resource/crud-resource.hbs',
    resourceTransferObjectTemplate: './templates/spring-resource/resource-transfer-object.hbs',
    resourceTransferObjectMapperTemplate: './templates/spring-resource/resource-transfer-object-mapper.hbs',
    resourceCompositeTransferObjectTemplate: './templates/spring-resource/resource-composite-transfer-object.hbs',
  };
  const createPlainJavaComponent = {
    type: 'createComponent',
    componentInterfaceTemplate: './templates/plain-java/component-interface.hbs',
    componentFacadeTemplate: './templates/plain-java/component-facade.hbs',
    componentBusinessLogicTemplate: './templates/plain-java/component-business-logic.hbs',
    componentDataObjectTemplate: './templates/plain-java/component-data-object.hbs',
    componentDataObjectMapperTemplate: './templates/plain-java/component-data-object-mapper.hbs'
  };

  plop.addHelper('lowerCase', function (p) {
    return p.toLowerCase();
  });
  plop.addHelper('lower', function (p) {
    return p.substr(0, 1).toLowerCase() + p.substr(1);
  });
  plop.addHelper('upperCase', function (p) {
    return p.toUpperCase();
  });

  plop.setActionType('createComponent', function (answers, config, plop) {

    const hasResource = !!answers.resourcePackage;
    let resourceBasePath;
    let resourceBasePackage;
    if (hasResource) {
      // <resources>
      const resourcePackagePath = answers.resourcePackage.split('.').join('/');
      answers.resourcePath = !!answers.resourcePath ? answers.resourcePath : answers.componentPath;
      resourceBasePath = [answers.resourcePath, resourcePackagePath, answers.componentName.toLowerCase()].join('/');
      resourceBasePackage = [answers.resourcePackage, answers.componentName.toLowerCase()].join('.');
      makeDir(resourceBasePath);
    }

    const configuration = {
      answers: {
        ...answers,
        componentBasePackage: [answers.componentPackage, answers.componentName.toLowerCase()].join('.'),
        hasResource: hasResource,
        resourceBasePackage: resourceBasePackage
      },
      plop: plop,
    };

    if (!!config.componentInterfaceTemplate) {
      const packagePath = answers.componentPackage.split('.').join('/');
      const basePath = [answers.componentPath, packagePath, answers.componentName.toLowerCase()].join('/');
      makeDir(basePath);

      // api
      const apiBasePath = [basePath, 'api'].join('/');
      makeDir(apiBasePath);
      renderFile(configuration, config.componentInterfaceTemplate, apiBasePath, 'Component.java');

      // api.types
      const typesBasePath = [apiBasePath, 'types'].join('/');
      makeDir(typesBasePath);
      renderFile(configuration, config.componentDataObjectTemplate, typesBasePath, 'DO.java');

      // impl
      const implBasePath = [basePath, 'impl'].join('/');
      makeDir(implBasePath);

      // impl.businesslogic
      const implBusinessBasePath = [implBasePath, 'businesslogic'].join('/');
      makeDir(implBusinessBasePath);
      renderFile(configuration, config.componentFacadeTemplate, implBusinessBasePath, 'Facade.java');

      // impl.businesslogic.logic
      const implBusinessLogicBasePath = [implBusinessBasePath, 'logic'].join('/');
      makeDir(implBusinessLogicBasePath);
      renderFile(configuration, config.componentBusinessLogicTemplate, implBusinessLogicBasePath, 'Logic.java');

      // impl.businesslogic.mapper
      const implMapperBasePath = [implBusinessBasePath, 'mapper'].join('/');
      makeDir(implMapperBasePath);
      renderFile(configuration, config.componentDataObjectMapperTemplate, implMapperBasePath, 'Mapper.java');

      if (answers.hasRepository && config.componentRepositoryTemplate) {
        // impl.data
        const implDataBasePath = [implBasePath, 'data'].join('/');
        makeDir(implDataBasePath);
        renderFile(configuration, config.componentRepositoryTemplate, implDataBasePath, 'Repository.java');

        if (config.componentEntityTemplate) {
          // impl.data.entities
          const implEntitiesBasePath = [implDataBasePath, 'entities'].join('/');
          makeDir(implEntitiesBasePath);
          renderFile(configuration, config.componentEntityTemplate, implEntitiesBasePath, 'Entity.java');
        }
      }
    }

    // REST resources
    if (hasResource) {
      // <resources>
      renderFile(configuration, config.resourceTemplate, resourceBasePath, 'sResourceV1.java');

      // <resource>.types
      const typesBasePath = [resourceBasePath, 'types'].join('/');
      makeDir(typesBasePath);
      renderFile(configuration, config.resourceTransferObjectTemplate, typesBasePath, 'TO.java');
      renderFile(configuration, config.resourceCompositeTransferObjectTemplate, typesBasePath, 'sCTO.java');

      // <resources>.mapper
      const transferObjectMapperBasePath = [resourceBasePath, 'mapper'].join('/');
      makeDir(transferObjectMapperBasePath);
      renderFile(configuration, config.resourceTransferObjectMapperTemplate, transferObjectMapperBasePath, 'Mapper.java');
    }

    return 'Component created';
  });

  plop.setGenerator('spring-component', {
    description: 'Generates a spring component',
    prompts: [
      ...defaultPrompts
    ],
    actions: [
      createSpringComponent,
      ...defaultActions
    ]
  });

  plop.setGenerator('spring-component-with-resource', {
    description: 'Generates a spring component',
    prompts: [
      ...defaultPrompts,
      {
        type: 'confirm',
        name: 'hasRepository',
        message: 'True, if the component has a data repository to access the database',
        default: false
      },
      {
        type: 'input',
        name: 'resourcePackage',
        message: 'Enter the resource resourcePackage, e.g. "com.mycompany.app.resources"',
        default: null
      },
      {
        type: 'input',
        name: 'resourcePath',
        message: 'Enter the REST resource source code directory, e.g. "/user/project-resources/src/main/java"',
        default: null
      },
    ],
    actions: [
      createSpringComponent,
      ...defaultActions
    ]
  });

  plop.setGenerator('spring-resource', {
    description: 'Generates a spring component',
    prompts: [
      ...defaultPrompts,
      {
        type: 'input',
        name: 'resourcePackage',
        message: 'Enter the resource resourcePackage, e.g. "com.mycompany.app.resources"',
        default: null
      },
      {
        type: 'input',
        name: 'resourcePath',
        message: 'Enter the REST resource source code directory, e.g. "/user/project-resources/src/main/java"',
        default: null
      },
    ],
    actions: [
      createSpringResource,
      ...defaultActions
    ]
  });


  plop.setGenerator('java-component', {
    description: 'Generates a plain java component',
    prompts: [
      ...defaultPrompts
    ],
    actions: [
      createPlainJavaComponent,
      ...defaultActions
    ]
  });
};