import { fadeFinder } from '/systems/fantastic-depths/module/utils/finder.mjs';
import { FDItem } from './FDItem.mjs';

export class ActorMasteryItem extends FDItem {
   /** @override */
   prepareBaseData() {
      super.prepareBaseData();
      this.system.effectiveLevel = this.system.level;
   }

   /** @override */
   prepareDerivedData() {
      super.prepareDerivedData();      
   }

   /**
    * @override
    * @param {any} changed
    * @param {any} options
    * @param {any} userId
    */
   _onUpdate(changed, options, userId) {
      super._onUpdate(changed, options, userId);
      if (changed.system?.level !== undefined) {
         // This is an async method
         this.updatePropertiesFromMastery();
      }
   }

   /** Update item properties based on FADE.WeaponMastery */
   async updatePropertiesFromMastery() {
      const { masteryItem, masteryLevel } = await this.getMastery(this.name, this.system.effectiveLevel);
      if (!masteryLevel) return; // Exit if no mastery data is found for the given name

      let result = {};

      // Update the mastery fields with data from the specified level in FADE.WeaponMastery
      result.weaponType = masteryItem.system.weaponType;
      result.primaryType = masteryItem.system.primaryType;
      result.range = {
         short: masteryLevel.range.short,
         medium: masteryLevel.range.medium,
         long: masteryLevel.range.long
      };

      Object.assign(result, masteryLevel);
      result.trainingFails = 0;

      await this.update({ system: result });
   }

   async getMastery(masteryName, level) {
      let result = null;
      const masteryItem = await fadeFinder.getWeaponMastery(masteryName);
      // If item is found...
      if (masteryItem != null) {
         result = masteryItem.system.levels.find(md => md.name === level)
      } else {
         console.warn(`Mastery data not found for ${masteryName}. Owner: ${this.parent?.name}.`);
      }
      return { masteryItem, masteryLevel: result };
   }

   async getInlineDescription() {
      let description = game.i18n.format('FADE.Mastery.summary', {
         weaponType: this.system.weaponType ? game.i18n.localize(`FADE.Mastery.weaponTypes.${this.system.weaponType}.long`) : '--',
         primaryType: game.i18n.localize(`FADE.Mastery.weaponTypes.${this.system.primaryType}.long`),
         special: this.system.special ?? '--',
         short: this.system.range.short ?? '--',
         medium: this.system.range.medium ?? '--',
         long: this.system.range.long ?? '--',
         defense: this.system.acBonusType ? `Defense vs. ${this.system.acBonusType}: ${this.system.acBonus ?? '--'}/${this.system.acBonusAT ?? '--'}` : 'No defense bonus'
      });
      if (description?.length <= 0) {
         description = '--';
      }
      return description;
   }
}