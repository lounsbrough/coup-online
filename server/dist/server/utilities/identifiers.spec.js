"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identifiers_1 = require("./identifiers");
describe('identifiers', () => {
    describe('generateRoomId', () => {
        it('should generate a random room id with 6 alpha-numeric characters', () => {
            const [first, second] = [(0, identifiers_1.generateRoomId)(), (0, identifiers_1.generateRoomId)()];
            const pattern = /^[A-Z0-9]{6}$/;
            expect(first).toMatch(pattern);
            expect(second).toMatch(pattern);
            expect(second).not.toBe(first);
        });
    });
});
//# sourceMappingURL=identifiers.spec.js.map