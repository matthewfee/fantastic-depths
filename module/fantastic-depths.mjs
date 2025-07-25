import { fadeFinder } from '/systems/fantastic-depths/module/utils/finder.mjs';
import { fadeSettings } from "./fadeSettings.mjs";
import { ActorFactory } from './actor/ActorFactory.mjs';
import { ItemFactory } from './item/ItemFactory.mjs';
import { AddonIntegration } from './sys/addonIntegration.mjs'
import { fadeRegistry } from './sys/registry/fadeRegistry.mjs'
import { fadeCompendium } from './sys/fadeCompendium.mjs'

import { CharacterDataModel } from './actor/dataModel/CharacterDataModel.mjs';
import { MonsterDataModel } from './actor/dataModel/MonsterDataModel.mjs';
import { FDCombatActor } from './actor/FDCombatActor.mjs';
import { CharacterSheet } from './sheets/CharacterSheet.mjs';
import { CharacterSheetBase } from './sheets/CharacterSheetBase.mjs';
import { MonsterSheet } from './sheets/MonsterSheet.mjs';

import { ClassDefinitionDataModel } from './item/dataModel/ClassDefinitionDataModel.mjs';
import { MasteryDefinitionDataModel } from "./item/dataModel/MasteryDefinitionDataModel.mjs";
import { ActorMasteryItemDM } from './item/dataModel/ActorMasteryItemDM.mjs';
import { ActorClassDataModel } from './item/dataModel/ActorClassDataModel.mjs';
import { GearItemDataModel } from './item/dataModel/GearItemDataModel.mjs';
import { ConditionItemDataModel } from './item/dataModel/ConditionItemDataModel.mjs';
import { ArmorItemDataModel } from './item/dataModel/ArmorItemDataModel.mjs';
import { SkillItemDataModel } from './item/dataModel/SkillItemDataModel.mjs';
import { LightItemDataModel } from './item/dataModel/LightItemDataModel.mjs';
import { SpellItemDataModel } from './item/dataModel/SpellItemDataModel.mjs';
import { WeaponItemDataModel } from './item/dataModel/WeaponItemDataModel.mjs';
import { SpecialAbilityDataModel } from './item/dataModel/SpecialAbilityDataModel.mjs';
import { AncestryDefinitionDM } from './item/dataModel/AncestryDefinitionDM.mjs';
import { GearItemSheet } from './sheets/GearItemSheet.mjs';
import { TreasureItemSheet } from './sheets/TreasureItemSheet.mjs';
import { ActorClassSheet } from './sheets/ActorClassSheet.mjs';
import { ActorMasterySheet } from './sheets/ActorMasterySheet.mjs';
import { ArmorItemSheet } from './sheets/ArmorItemSheet.mjs';
import { ClassDefinitionItemSheet } from './sheets/ClassDefinitionItemSheet.mjs';
import { MasteryDefinitionSheet } from './sheets/MasteryDefinitionSheet.mjs';
import { SkillItemSheet } from './sheets/SkillItemSheet.mjs';
import { SpecialAbilitySheet } from './sheets/SpecialAbilitySheet.mjs';
import { SpellItemSheet } from './sheets/SpellItemSheet.mjs';
import { WeaponItemSheet } from './sheets/WeaponItemSheet.mjs';
import { ConditionItemSheet } from './sheets/ConditionItemSheet.mjs';
import { AncestryDefinitionSheet } from './sheets/AncestryDefinitionSheet.mjs';

import { TurnTrackerForm } from './apps/TurnTrackerForm.mjs';
import { PartyTrackerForm } from './apps/PartyTrackerForm.mjs';
import { PlayerCombatForm } from './apps/PlayerCombatForm.mjs';
import { preloadHandlebarsTemplates } from './sys/templates.mjs';
import { FADE } from './sys/config.mjs';
import { fadeCombat } from './sys/combat/fadeCombat.mjs'
import { fadeCombatant } from './sys/combat/fadeCombatant.mjs'
import { MacroManager } from './sys/MacroManager.mjs';
import { LightManager } from './sys/LightManager.mjs';
import { fadeHandlebars } from './fadeHandlebars.mjs';
import { fadeDialog } from './dialog/fadeDialog.mjs';
import { DamageRollChatBuilder } from './chat/DamageRollChatBuilder.mjs';
import { AttackRollChatBuilder } from './chat/AttackRollChatBuilder.mjs';
import { SpellCastChatBuilder } from './chat/SpellCastChatBuilder.mjs';
import { DataMigrator } from './sys/migration.mjs';
import { EffectManager } from './sys/EffectManager.mjs';
import { ToastManager } from './sys/ToastManager.mjs';
import { Collapser } from './utils/collapser.mjs';
import { fadeChatMessage } from './sys/fadeChatMessage.mjs'
import { SocketManager } from './sys/SocketManager.mjs'
import { fadeEffect } from './sys/fadeEffect.mjs'
import { fadeTreasure } from './utils/fadeTreasure.mjs'

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
Hooks.once('init', async function () {
   // Add utility classes to the global game object so that they're more easily
   // accessible in global contexts.
   game.fade = {
      MacroManager,
      LightManager,
      TurnTrackerForm,
      PartyTrackerForm,
      AttackRollChatBuilder,
      fadeDialog,
      DataMigrator,
      PlayerCombatForm,
      fadeTreasure,
      fadeFinder,
      registry: new fadeRegistry()
   };

   Hooks.call("beforeFadeInit", game.fadeRegistry);

   // Add custom constants for configuration.
   CONFIG.FADE = FADE;

   CONFIG.ActiveEffect.documentClass = fadeEffect;
   CONFIG.Combat.documentClass = fadeCombat;
   CONFIG.Combatant.documentClass = fadeCombatant;
   CONFIG.ChatMessage.documentClass = fadeChatMessage;
   CONFIG.Actor.documentClass = ActorFactory;
   CONFIG.Actor.dataModels = {
      character: CharacterDataModel,
      monster: MonsterDataModel,
   };
   CONFIG.Item.documentClass = ItemFactory;
   CONFIG.Item.dataModels = {
      treasure: GearItemDataModel,
      item: GearItemDataModel,
      armor: ArmorItemDataModel,
      skill: SkillItemDataModel,
      light: LightItemDataModel,
      spell: SpellItemDataModel,
      weapon: WeaponItemDataModel,
      mastery: ActorMasteryItemDM,
      actorClass: ActorClassDataModel,
      class: ClassDefinitionDataModel,
      weaponMastery: MasteryDefinitionDataModel,
      specialAbility: SpecialAbilityDataModel,
      condition: ConditionItemDataModel,
      species: AncestryDefinitionDM
   };

   // Active Effects are never copied to the Actor,
   // but will still apply to the Actor from within the Item
   // if the transfer property on the Active Effect is true.
   CONFIG.ActiveEffect.legacyTransferral = false;

   registerSheets();

   await handleAsyncInit();

   Hooks.call("afterFadeInit", game.fade.registry);
});

function registerSheets() {
   // TODO: Remove after v12 support.
   const gActors = foundry?.documents?.collections?.Actors ? foundry.documents.collections.Actors : Actors;
   const gItems = foundry?.documents?.collections?.Items ? foundry.documents.collections.Items : Items;

   // Register sheet application classes

   // TODO: Remove after v12 support.
   const gActorSheet = foundry?.appv1?.sheets?.ActorSheet ? foundry.appv1.sheets.ActorSheet : ActorSheet;
   gActors.unregisterSheet('core', gActorSheet);
   gActors.registerSheet('fantastic-depths', CharacterSheet, {
      label: 'FADE.SheetLabel.Character',
      types: ['character'],
      makeDefault: true
   });
   gActors.registerSheet('fantastic-depths', CharacterSheetBase, {
      label: 'FADE.SheetLabel.CharacterSheetBase',
      types: ['character'],
      makeDefault: false
   });
   gActors.registerSheet('fantastic-depths', MonsterSheet, {
      label: 'FADE.SheetLabel.Monster',
      types: ['monster'],
      makeDefault: true
   });
   // TODO: Remove after v12 support.
   const gItemSheet = foundry?.appv1?.sheets?.ItemSheet ? foundry.appv1.sheets.ItemSheet : ItemSheet;
   gItems.unregisterSheet('core', gItemSheet);
   gItems.registerSheet('fantastic-depths', GearItemSheet, {
      label: 'FADE.SheetLabel.Item',
      makeDefault: true,
      types: ['item', 'light']
   });
   gItems.registerSheet('fantastic-depths', TreasureItemSheet, {
      label: 'FADE.SheetLabel.TreasureItem',
      makeDefault: true,
      types: ['treasure']
   });
   gItems.registerSheet('fantastic-depths', ActorClassSheet, {
      label: 'FADE.SheetLabel.ActorClassItem',
      types: ['actorClass'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', ActorMasterySheet, {
      label: 'FADE.SheetLabel.ActorMasteryItem',
      types: ['mastery'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', ArmorItemSheet, {
      label: 'FADE.SheetLabel.ArmorItem',
      types: ['armor'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', ClassDefinitionItemSheet, {
      label: 'FADE.SheetLabel.ClassDefinitionItem',
      types: ['class'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', MasteryDefinitionSheet, {
      label: 'FADE.SheetLabel.MasteryDefinitionItem',
      types: ['weaponMastery'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', SkillItemSheet, {
      label: 'FADE.SheetLabel.SkillItem',
      types: ['skill'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', SpecialAbilitySheet, {
      label: 'FADE.SheetLabel.SpecialAbilityItem',
      types: ['specialAbility'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', SpellItemSheet, {
      label: 'FADE.SheetLabel.SpellItem',
      types: ['spell'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', WeaponItemSheet, {
      label: 'FADE.SheetLabel.WeaponItem',
      types: ['weapon'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', ConditionItemSheet, {
      label: 'FADE.SheetLabel.ConditionItem',
      types: ['condition'],
      makeDefault: true
   });
   gItems.registerSheet('fantastic-depths', AncestryDefinitionSheet, {
      label: 'FADE.SheetLabel.AncestryDefinitionItem',
      types: ['species'],
      makeDefault: true
   });
}

async function handleAsyncInit() {
   // Register System Settings
   const settings = new fadeSettings();
   settings.RegisterSystemSettings();
   // Hook into the rendering of the settings form
   Hooks.on("renderSettingsConfig", (app, html, data) => settings.renderSettingsConfig(app, html, data));
   const fxMgr = new EffectManager();
   await fxMgr.OnGameInit();

   // Preload Handlebars templates.
   await preloadHandlebarsTemplates();

   await game.fade.registry.registerDefaultSystems();
}

Hooks.once("setup", function () {
   // Apply custom item compendium
   game.packs.filter(p => p.metadata.type === "Item")
      .forEach(p => p.applicationClass = fadeCompendium);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
Hooks.once('ready', async function () {
   Hooks.call("beforeFadeReady", game.fadeRegistry);

   const migrator = new DataMigrator();
   await migrator.migrate();

   // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
   Hooks.on('hotbarDrop', (bar, data, slot) => {
      MacroManager.createItemMacro(data, slot);
   });

   LightManager.initialize();

   // inline-roll handler
   $(document).on('click', '.damage-roll,.heal-roll', DamageRollChatBuilder.clickDamageRoll);
   $(document).on('click', '.apply-damage, .apply-heal', DamageRollChatBuilder.clickApplyDamage);
   $(document).on('click', '.apply-condition', async (event) => await SpellCastChatBuilder.clickApplyCondition(event));
   $(document).on('click', '.collapser', Collapser.toggleCollapsibleContent);
   $(document).on('click', '.saving-roll', FDCombatActor.handleSavingThrowRequest);

   const fxMgr = new EffectManager();
   await fxMgr.OnGameReady();

   if (game.socket) {
      game.fade.SocketManager = new SocketManager();
      const toastsEnabled = game.settings.get(game.system.id, "toasts");
      if (toastsEnabled) {
         // Ensure that the socket is ready before using it
         game.fade.toastManager = new ToastManager();
         game.socket.on(`system.${game.system.id}`, (data) => {
            //console.debug("onSocketReceived", data);
            if (data.action === 'showToast') {
               // Call the public method to create the toast
               game.fade.toastManager.createToastFromSocket(data.message, data.type, data.useHtml);
            } else {
               game.fade.SocketManager.receiveSocketMessage(data)
            }
         });
         console.info(`Registered socket listener: system.${game.system.id}`);
      }
   } else {
      console.warn(`Game socket not found: system.${game.system.id}`);
   }

   // Set the length of a round of combat.
   CONFIG.time.roundTime = game.settings.get(game.system.id, "roundDurationSec") ?? 10;

   if (game.user.isGM === true) {
      /* Hook for time advancement. */
      Hooks.on('updateWorldTime', async (worldTime, dt, options, userId) => {
         if (game.user.isGM === true) {
         await LightManager.onUpdateWorldTime(worldTime, dt, options, userId);
         //console.debug("updateWorldTime", worldTime, dt, options, userId);
         const placeables = canvas?.tokens.placeables;
         for (let placeable of placeables) {
            const token = placeable.document;
            if (token.actor) {  // Only process tokens with an actor
               token.actor.onUpdateWorldTime(worldTime, dt, options, userId);  // Correctly call the actor's method
            }
         }
         }
      });
      /* -------------------------------------------- */
      /*  Log Changes                                 */
      /* -------------------------------------------- */
      // Hook into `updateActor` to compare the old and new values
      Hooks.on("updateActor", async (actor, updateData, options, userId) => {
         if (game.user.isGM) {
            await actor?.onUpdateActor(updateData, options, userId);
         }
      });

      // Hook into item creation (added to the actor)
      Hooks.on("createItem", async (item, options, userId) => {
         if (game.user.isGM) {
            const actor = item.parent; // The actor the item belongs to
            await actor?.onCreateActorItem(item, options, userId);
         }
      });

      // Hook into item updates (e.g., changes to an existing item)
      Hooks.on("updateItem", async (item, updateData, options, userId) => {
         if (game.user.isGM) {
            const actor = item.parent; // The actor the item belongs to
            await actor?.onUpdateActorItem(item, updateData, options, userId);
         }
      });

      // Hook into item deletion (removed from the actor)
      Hooks.on("deleteItem", (item, options, userId) => {
         if (game.user.isGM) {
            const actor = item.parent; // The actor the item belongs to
            actor?.onDeleteActorItem(item, options, userId);
         }
      });
   }

   Hooks.call("afterFadeReady", game.fadeRegistry);
});

AddonIntegration.setupItemPiles();
fadeHandlebars.registerHelpers();
fadeCombat.initialize();

// License info
Hooks.on("renderSidebarTab", async (object, html) => {
   if (object instanceof Settings) {
      const gamesystem = html.find("#game-details");
      const template = `/systems/fantastic-depths/templates/sidebar/general-info.hbs`;
      const rendered = await renderTemplate(template);
      gamesystem.find(".system").after(rendered);
   }
});