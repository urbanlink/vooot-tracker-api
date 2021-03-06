'use strict';

var models = require('./../../src/api/models');
var settings = require('./../../src/config/settings');
var bcrypt = require('bcrypt');

// Create account_role_types
models.account_role_type.bulkCreate([
  { value: 'administrator' },
  { value: 'editor' },
]).then(function(roles) {
  console.log('account_role_types created. ');
  // Create admin user
  var salt = bcrypt.genSaltSync(10);
  var hashedPassword = bcrypt.hashSync('123', salt);

  models.account.create({
    email: 'arn@urbanlink.nl',
    salt: salt,
    password: hashedPassword,
    verified: true,
  }).then(function(account){
    console.log('admin account created. ');
    models.account_role.create({
      account_id: 1,
      type_id: 1
    }).then(function(result) {
      console.log('admin role created. ');
      // Create identifier_types
      models.identifier_type.bulkCreate([
        { value: 'ori', name: 'ORI', description: 'Open Raads Informatie' }
      ]).then(function(result) {
        console.log('identifier_types created');
        // Create membership_roles
        models.membership_role.bulkCreate([
          { value: 'member', name: 'Lid' },
          { value: 'mayor', name: 'Burgemeester' },
          { value: 'alderman', name: 'Wethouder' },
          { value: 'chairman', name: 'Voorzitter' },
        ]).then(function(result) {
          console.log('membership_roles created');
          // Create organization_classifications
          models.organization_classification.bulkCreate([
            { value: 'municipality', name: 'Gemeente' },
            { value: 'council', name: 'Raad' },
            { value: 'commity', name: 'Commissie' }
          ]).then(function(result) {
            console.log('organization_classifications created');
            // Create person_contact_types
            models.person_contact_type.bulkCreate([
              { value: 'address_home' },
              { value: 'address_work' },
              { value: 'email_work' },
              { value: 'facebook' },
              { value: 'twitter' },
              { value: 'instagram' },
              { value: 'phone_mobile' },
              { value: 'website_personal' },
              { value: 'website_work' },
              { value: 'website_other' },
              { value: 'email_personal' }
            ]).then(function(result) {
              console.log('person_contact_types created');
              // Create person_othername_types
              models.person_othername_type.bulkCreate([

              ]).then(function(result) {
                console.log('person_othername_types created');
                console.log('Done seeding');
              });
            });
          });
        });
      });
    });
  });
});


// 'use strict';
//
// var models = require('./../../api/models');
// var settings = require('./../../config/settings');
// var extractor = require('./../../extractors/almanak/organizations');
// var personExtractor = require('./../../extractors/almanak/persons');
//
// function asyncLoop(iterations, func, callback) {
//   var index = 0;
//   var done = false;
//   var loop = {
//     next: function() {
//       if (done) { return; }
//
//       if (index < iterations) {
//         index++;
//         func(loop);
//       } else {
//         done = true;
//         callback();
//       }
//     },
//
//     iteration: function() {
//       return index - 1;
//     },
//
//     break: function() {
//       done = true;
//       callback();
//     }
//   };
//   loop.next();
//   return loop;
// }
//
//
// function createParty(party, cb) {
//   models.organization.find({ where: {
//     name: party.name
//   }}).then(function(result) {
//     if (!result) {
//       models.organization.create(party).then(function(result) {
//         cb(result);
//       }).catch(function(error){
//         logger.info(error);
//       });
//     } else {
//       cb(result);
//     }
//   }).catch(function(error) {
//     logger.info(error);
//   });
// }
//
// function createOrganization(organization, cb) {
//   models.organization.create(organization).then(function(result) {
//     models.identifier.create({
//       scheme: organization.identifiers[0].scheme,
//       identifier: organization.identifiers[0].identifier,
//       organization_id: result.id
//     }).then(function(identifier) {
//       cb();
//     }).catch(function(error) {
//       logger.info(error);
//     });
//   });
// }
//
// function createPerson(person, cb) {
//   logger.info('Creating person: ', person);
//   models.person.create(person).then(function(result) {
//     var newPerson = result.dataValues;
//     // Add identifier
//     models.identifier.create({
//       scheme: person.identifiers[ 0].scheme,
//       identifier: person.identifiers[ 0].identifier,
//       person_id: newPerson.id
//     }).then(function(identifier) {
//       logger.info(identifier);
//       newPerson.identifiers = [];
//       newPerson.identifiers.push(identifier.dataValues);
//       cb(newPerson);
//     }).catch(function(error) {
//       logger.info(error);
//     });
//   }).catch(function(error) {
//     logger.info(error);
//   });
// }
//
// module.exports = {
//
//   // Get all municipalities from almanak.overheid
//   organizations: function(cb) {
//     models.organization.destroy({where: {}}).then(function(result) {
//       logger.info('Organizations deleted. ');
//       models.event.destroy({where: {}}).then(function(result) {
//         logger.info('Events deleted. ');
//         models.identifier.destroy({where: {}}).then(function(result){
//           extractor.extractMunicipalities({}, {
//             json: function(result) {
//               var organizations = result;
//               logger.info('Municipalities extracted. ');
//               logger.info('Do the loop');
//               asyncLoop(organizations.length, function(loop) {
//                 createOrganization(organizations[ loop.iteration()], function(result) {
//                   // Okay, for cycle could continue
//                   loop.next();
//                 });
//               }, function() {
//                 logger.info('Loop finished!');
//                 cb();
//               });
//             }
//           });
//         });
//       });
//     });
//   },
//
//   // Get all persons from all municipalities and add membership to municipality and party
//   persons: function(cb) {
//     logger.info('Extracting persons. ');
//     // Fetch all municipalities from the database.
//     models.organization.findAll({
//       where: {
//         classification: 'municipality'
//       },
//       include: [{
//         model: models.identifier,
//         as: 'identifiers',
//         attributes: ['scheme', 'identifier'],
//         where: {
//           scheme: 'almanak'
//         }
//       }]
//     }).then(function(result) {
//       logger.info(result.length + ' organizations retrieved.');
//       // Placeholder for the list of all persons.
//       var persons = [];
//       // Fetch all persons from almanak per municipality
//       logger.info('starting the loop');
//       asyncLoop(result.length, function(loop) {
//         var source =  'https://almanak.overheid.nl' + result[ loop.iteration()].identifiers[0].identifier;
//         var organizationId = result[ loop.iteration()].id;
//         logger.info('Organization id: ' + organizationId);
//
//         // Get the persons from the municipality.
//         personExtractor.extractPersons({ query: { source: source}}, {
//           json: function(result) {
//             logger.info('Number of persons received: ' + result.length);
//             // Add to the total persons array
//             persons = persons.concat(result);
//
//             // add persons and identifiers.
//             asyncLoop(result.length, function(loop2) {
//               var person = result[ loop2.iteration()];
//               logger.info('Result person: ', person);
//
//               createPerson(person, function(newPerson) {
//                 logger.info('Person create result: ', newPerson);
//                 // Create Party if not exists
//                 var party = {
//                   classification: 'party',
//                   name: person.memberships[ 1].party
//                 };
//                 logger.info('Creating party: ', party);
//                 createParty(party, function(result){
//                   logger.info('Creating party result: ', result);
//                   logger.info(models.membership);
//                   logger.info(newPerson);
//                   // Create membership for the party for the person
//                   models.membership.create({
//                     person_id: newPerson.id,
//                     organization_id: result.dataValues.id,
//                     role: 'member'
//                   }).then(function(result) {
//                     logger.info(result);
//                     models.membership.create({
//                       person_id: newPerson.id,
//                       organization_id: organizationId,
//                       role: 'council member'
//                     }).then(function(result) {
//                       loop2.next();
//                     }).catch(function(error) {
//                       logger.info(error);
//                     });
//                   });
//                 });
//               });
//             }, function() {
//               loop.next();
//             });
//           }
//         });
//       }, function() {
//         logger.info('get persons list complete');
//         logger.info(persons.length);
//         logger.info(persons[ 0]);
//         cb();
//       });
//     }).catch(function(error) {
//       logger.info(error);
//     });
//   }
//
//
//
//
//   // organizations: function(cb) {
//   //   models.organization.destroy({where: {}}).then(function(result) {
//   //     logger.info('Organizations deleted. ');
//   //     models.event.destroy({where: {}}).then(function(result) {
//   //       logger.info('Events deleted. ');
//   //       models.identifier.destroy({where: {}}).then(function(result){
//   //         models.organization.create({
//   //           name: 'Gemeente Den Haag',
//   //           classification: 'municipality',
//   //         }).then(function(organization) {
//   //             models.identifier.create({
//   //             scheme: 'notubiz',
//   //             identifier: 'denhaag',
//   //             organization_id: organization.id
//   //           }).then(function(result) {
//   //             logger.info('Identifier created: ' + result.id);
//   //             // Create persons
//   //             models.person.bulkCreate([
//   //               {
//   //                 name: 'Johan Eenhoorn',
//   //                 function: 'Raadslid Gemeenteraad Den Haag',
//   //                 party: 'Haagse Stedeljke Partij (HSP)',
//   //                 period: '2014-2018',
//   //                 image: '/assets/images/persons/headshot.jpg'
//   //               },
//   //               {
//   //                 name: 'Arend Kapitein',
//   //                 function: 'Raadslid Den Haag',
//   //                 party: 'Groenlinks (GL)',
//   //                 period: '2014-2018',
//   //                 image: '/assets/images/persons/headshot2.jpg'
//   //               },
//   //               {
//   //                 name: 'Anja van de Plein',
//   //                 function: 'Raadslid',
//   //                 period: '2014-2018',
//   //                 image: '/assets/images/persons/headshot3.jpg'
//   //               }
//   //             ]).then(function(result) {
//   //               cb();
//   //             }).catch(function(error) {
//   //               logger.info(error);
//   //             });
//   //           }).catch(function(error){
//   //             logger.info(error);
//   //           });
//   //         }).catch(function(error){
//   //           logger.info(error);
//   //         });
//   //       });
//   //     });
//   //   });
//   // }
// };
