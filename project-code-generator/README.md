# Using a template engine to generate project code

Run `npm install`. 

Now run `plop` to start an input dialog.

Example plop generators:

## Maven/ Java

Following file structure will be generated:

```
<path> 
└ <componentPackage>
└ .<componentName>
  ├ .api
  │ ├ .types
  │ │ └ <componentName>DO.java
  │ └ <componentName>Component.java
  └ .impl
    ├ .businesslogic
    │ ├ .logic
    │ │ └ <componentName>Logic.java
    │ ├ .mapper
    │ │ └ <componentName>Mapper.java
    │ └ <componentName>Facade.java
    └ .data (1)
      ├ .entities
      │ └ <componentName>Entity.java
      └ <componentName>Repository.java

"." indicates a sub-package

(1) The .data package is only generated 
    if a "componentRepositoryTemplate" is defined.
```



#### Plain Java Component
`plop java-component -- --componentPath ./test/my-app/src/main/java --componentPackage com.mycompany.app.components --hasRepository false --componentName MyJava`

```
--componentPath : Path to your source code directory
--componentPackage : Existing package inside the --path source code directories
--componentName : Name of your component
--hasRepository : Should I generate the .data package? (default = false)
```

#### Spring Component

A Spring component uses the Spring Context annotations and a Spring Data JPA repository.

`plop spring-component -- --componentPath ./test/my-app/src/main/java --componentPackage com.mycompany.app.components --hasRepository true --componentName MySpring`
`plop spring-component-with-resource -- --componentPath ./test/my-app/src/main/java --componentPackage com.mycompany.app.components --resourcePath ./test/my-app/src/main/java --resourcePackage com.mycompany.app.resources --hasRepository true --componentName MySpringWithResource`
`plop spring-resource -- --componentPath ./test/my-app/src/main/java --componentPackage com.mycompany.app.components --resourcePath ./test/my-app/src/main/java --resourcePackage com.mycompany.app.resources --componentName MySpringResource`

```
--componentPath : Path to your source code directory
--componentPackage : Existing package inside the --path source code directories
--resourcePath : Path to your source code directory of the resources
--resourcePackage : Existing package inside the --resourcePath source code directories
--componentName : Name of your component
--hasRepository : Should I generate the .data package? (default = false)
```

#### Links:
- https://plopjs.com/ Generator
- https://handlebarsjs.com/ Engine
- http://mustache.github.io/ Syntax
- https://github.com/SBoudrias/Inquirer.js/ Prompts

