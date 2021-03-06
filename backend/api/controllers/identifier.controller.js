'use strict';

var models = require('../models/index');
var settings = require('../../config/settings');
var logger = require('../../config/logger');
var utils = require('../utils');


exports.types = function(req,res) {
  models.identifier_type.findAll().then(function(result) {
    return res.json(result);
  }).catch(function(err) {
    return utils.handleError(res,err);
  });
};


// Create a new identifier
exports.create = function(req, res) {
  // if validator.isPerson() && validator.isIdentifierType()
  models.identifier.create({
    value: req.body.value,
    type_id: req.body.type_id,
    person_id: req.body.person_id
  }).then(function(result) {
    logger.info('Identifier created. ');
    return res.json(result);
  }).catch(function(error) {
    return utils.handleError(res,error);
  });
};

// Update an identifier
exports.update = function(req,res) {
  logger.info('Updating identrifier ' + req.params.identifierId, req.body);

  models.identifier.update(req.body, {
    where: { id: req.params.identifierId }
  }).then(function(result) {
    return res.json(result);
  }).catch(function(err){
    return utils.handleError(res,err);
  });
};

// Remove an identifier
exports.delete = function(req,res) {
  logger.info('Removing identifier: ' + req.params.identifierId);
  models.identifier.destroy({
    where: {
      id: req.params.identifierId
    }
  }).then(function(result) {
    logger.info('Identifier desctroyed', result);
    return res.json(result);
  }).catch(function(error) {
    return utils.handleError(res,error);
  });
};
