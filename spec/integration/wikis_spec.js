const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis/";
const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("routes : wikis ", () => {

    beforeEach((done) => {
        this.user;
        this.wiki;
        sequelize.sync({force: true}).then((res) => {

            User.create({
                email: "user@test.com",
                password: "123456789",
                role: 0
            })
            .then((user) => {
                this.user = user;

                Wiki.create({
                    title: "NFL",
                    body: "Adrian Peterson is the best back of all time.",
                    private: false,
                    userId: this.user.id
                })
                .then((wiki) => {
                    this.wiki = wiki;
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    describe("admin, premium and standard users performing CRUD actions for Wiki", () => {
         beforeEach((done) => {
             request.get({
                 url: "http://localhost:3000/auth/fake",
                 form: {
                     userId: this.user.id,
                     email: this.user.email,
                     role: this.user.role
                 }
             }, (err, res, body) => {
                done();
            });
        });

    describe("GET /wikis", () => {

      it("should return a status code 200 and all wikis", (done) => {
               request.get(base, (err, res, body) => {
                   expect(res.statusCode).toBe(200);
                   expect(err).toBeNull();
                   expect(body).toContain("Wikis");
                   expect(body).toContain("Snowboarding");
                   done();
               });
            });
        });
        describe("GET /wikis/new", () => {

              it("should render a new wiki form", (done) => {
                  request.get(`${base}new`, (err, res, body) => {
                      expect(err).toBeNull();
                      expect(body).toContain("New Wiki");
                    done();
                });
              });
         });

         describe("POST /wikis/create", () => {

             it("should create a new wiki and redirect", (done) => {

             const options = {
                 url: `${base}create`,
                 form: {
                     title: "Rock Climbing",
                     body: "Free soloing is easy!",
                     userId: this.user.id,
                     private: false
                 },
             };
             request.post(options,
                 (err, res, body) => {
                     Wiki.findOne({where: {title: "Rock Climbing"}})
                     .then((wiki) => {
                         expect(wiki.title).toBe("Rock Climbing");
                         expect(wiki.body).toBe("Free soloing is easy!");
                         done();
                     })
                     .catch((err) => {
                         console.log(err);
                         done();
                     });
                 }
             );
             });
        });

        describe("GET /wikis/:id", () => {

                 it("should render a view with the selected wiki", (done) => {
                     request.get(`${base}${this.wiki.id}`, (err, res, body) => {
                         expect(err).toBeNull();
                         expect(body).toContain("Snowboarding");
                         done();
                     });
                 });
             });
             describe("POST /wikis/:id/destroy", () => {

                        it("should delete the topic with the associated ID", (done) => {

                            Wiki.all()
                            .then((wikis) => {

                                const wikiCountBeforeDelete = wikis.length;

                                expect(wikiCountBeforeDelete).toBe(1);

                                request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
                                    Wiki.all()
                                    .then((wikis) => {
                                        expect(err).toBeNull();
                                        expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
                                        done();
                                    })
                                });
                            });
                        });
                    });

                    describe("GET /wikis/:id/edit", () => {

                             it("should render a view iwth an edit wiki form", (done) => {
                                 request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
                                     expect(err).toBeNull();
                                     expect(body).toContain("Edit Wiki");
                                     expect(body).toContain("Snowboarding");
                                     done();
                                 });
                             });
                         });

                         describe("POST /wikis/:id/update", () => {

                                  it("should update the wiki with the given values", (done) => {

                                      const options = {
                                          url: `${base}${this.wiki.id}/update`,
                                          form: {
                                              title: "Surfing",
                                              body: "get so pitted!"
                                          }
                                      };

                                      request.post(options,
                                          (err, res, body) => {

                                              expect(err).toBeNull();

                                              Wiki.findOne({
                                                  where: { id: this.wiki.id }
                                              })
                                              .then((wiki) => {
                                                  expect(wiki.title).toBe("Surfing");
                                                  done();
                                              });
                                          });
                                  });
                              });
                          });
                      });
