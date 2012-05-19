(function() {
  var EXAMPLES, Example, ExampleApplication, ExampleEditor, ExamplePreview;

  Example = potato.Model({
    properties: {
      application: potato.View
    },
    components: {
      label: potato.String,
      coffeeScript: potato.String
    },
    "static": {
      makeFromCoffeeScript: function(label, coffeeScript) {
        var example;
        example = Example.make({
          "label": label,
          "coffeeScript": coffeeScript
        });
        example.application = CoffeeScript["eval"](coffeeScript);
        return example;
      }
    }
  });

  ExampleEditor = potato.View({
    el: "<div class='editor-container'>",
    events: {
      "": {
        "render": function() {
          return this.editor = CodeMirror(this.el.get(0), this.editorConfig());
        }
      }
    },
    methods: {
      load: function(example) {
        return this.editor.setValue(example.coffeeScript);
      },
      editorConfig: function() {
        return {
          lineNumbers: true,
          lineWrapping: true,
          theme: "neat",
          smartIndent: false,
          tabSize: 2,
          indentWithTabs: false,
          indentUnit: 2,
          mode: "coffeescript"
        };
      }
    }
  });

  ExamplePreview = potato.View({
    el: "<div class='preview'>",
    components: {
      example: potato.View
    },
    methods: {
      load: function(example) {
        return this.application = example.application.loadInto(this.el);
      }
    }
  });

  ExampleApplication = potato.View({
    template: "<div class=\"row-fluid\">\n    <div class=\"span2\">\n        <div class=\"sidebar-nav sidebar-nav-fixed\">\n            <#menu/>\n        </div>\n    </div>\n    <div class=\"span6 content\">\n        <#editor/>\n    </div>\n    <div id=\"content\" class=\"span4 content\">\n       <#preview/>\n    </div>\n</div>",
    model: potato.MapOf(Example),
    methods: {
      load: function(exampleLabel, exampleSrc) {
        var _this = this;
        return $.get("examples/" + exampleSrc, {}, function(source) {
          var example;
          example = Example.makeFromCoffeeScript(exampleLabel, source);
          return _this.addExample(exampleSrc, example);
        });
      },
      addExample: function(exampleId, example) {
        this.menu.addItem(exampleId, example.label);
        this.model[exampleId] = example;
        return this.menu.render();
      }
    },
    components: {
      menu: potato.TabMenu({
        el: "<ul class='menu nav nav-list'>",
        template: "<li class=\"nav-header\">Examples</li>\n{{#model}}<li data-item_id='{{id}}'><a>{{label}}</a></li>{{/model}}"
      }),
      editor: ExampleEditor,
      preview: ExamplePreview
    },
    events: {
      "@menu": {
        "select": function(exampleId) {
          var example;
          example = this.model[exampleId];
          this.editor.load(example);
          return this.preview.load(example);
        }
      }
    }
  });

  EXAMPLES = {
    Todo: "todo.coffee",
    Form: "form.coffee",
    Scraper: "scraper.coffee",
    Inheritance: "inheritance.coffee"
  };

  $(function() {
    var exampleId, exampleSrc, _results;
    window.exampleApplication = ExampleApplication.loadInto($("#container"));
    _results = [];
    for (exampleId in EXAMPLES) {
      exampleSrc = EXAMPLES[exampleId];
      _results.push(exampleApplication.load(exampleId, exampleSrc));
    }
    return _results;
  });

}).call(this);
