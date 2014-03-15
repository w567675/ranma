var homunculus = require('homunculus');

var Token = homunculus.getClass('token');
var JsNode = homunculus.getClass('node', 'js');

var isCommonJS;
var isAMD;
var isCMD;

var Context = require('./Context');

function recursion(node, context, global) {
  var isToken = node.name() == JsNode.TOKEN;
  var isVirtual = isToken && node.token().type() == Token.VIRTUAL;
  if(isToken) {
    if(!isVirtual) {
    }
  }
  else {
    if(node.name() == JsNode.VARDECL) {
      vardecl(node, context);
    }
    else if(node.name() == JsNode.FNDECL) {
      context = fndecl(node, context);
    }
    else if(node.name() == JsNode.FNEXPR) {
      context = fnexpr(node, context);
    }
    node.leaves().forEach(function(leaf, i) {
      recursion(leaf, context, global);
    });
  }
}
function vardecl(node, context) {
  var leaves = node.leaves();
  var v = leaves[0].leaves().content();
  var assign = !!leaves[1];
  context.addVar(v, assign);
}
function fndecl(node, context) {
  var v = node.leaves()[1].leaves().content();
  var child = new Context(context, v);
  var params = node.leaves()[3];
  if(params.name() == JsNode.PARAMS) {
    addParam(params, child);
  }
  return child;
}
function fnexpr(node, context) {
  //函数表达式name为空
  var child = new Context(context, null);
  var params;
  var v = node.leaves()[1];
  if(v.name() == JsNode.TOKEN) {
    params = node.leaves()[3];
  }
  else {
    params = node.leaves()[2];
  }
  if(params.name() == JsNode.PARAMS) {
    addParam(params, child);
  }
  return child;
}
function addParam(params, child) {
  params.leaves().forEach(function(leaf, i) {
    if(i % 2 == 0) {
      if(leaf.name() == JsNode.TOKEN) {
        child.addParam(leaf.token().content());
      }
      else if(leaf.name() == JsNode.RESTPARAM) {
        child.addParam(leaf.leaves()[1].token().content());
      }
      else if(leaf.name() == JsNode.BINDELEMENT) {
        child.addParam(leaf.leaves()[1].leaves().token().content());
      }
    }
  });
}

exports.type = function(code) {
  isCommonJS = false;
  isAMD = false;
  isCMD = false;

  var parser = homunculus.getParser('js');
  var node = parser.parse(code);
  var global = new Context();
  recursion(node, global, global);

  return {
    'isCommonJS': isCommonJS,
    'isAMD': isAMD,
    'isCMD': isCMD
  };
};

exports.isCommonJS = function(code) {
  if(code) {
    exports.type(code);
  }
  return isCommonJS;
};

exports.isAMD = function(code) {
  if(code) {
    exports.type(code);
  }
  return isAMD;
};

exports.isCMD = function(code) {
  if(code) {
    exports.type(code);
  }
  return isCMD;
};