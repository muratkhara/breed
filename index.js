require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QuickDB } = require('quick.db');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const db = new QuickDB();
const pendingRequests = new Map();

// Add your allowed channel IDs here (replace with actual channel IDs)
const ALLOWED_CHANNELS = [
  '1440778573693583410' // breeding channel
];
const CHANNEL_RESTRICTION_ENABLED = true; // Set to true to enable channel restrictions

const getProfile = async (userId) => {
  const profile = await db.get(`profile_${userId}`);
  return profile || { gender: null, activePregnancy: null, babies: [], totalBabies: 0 };
};

const setProfile = async (userId, profile) => {
  await db.set(`profile_${userId}`, profile);
};

client.on('clientReady', async () => {
  console.log(`${client.user.tag} online! 👶 Breeding game active!`);
  const cmds = [
    new SlashCommandBuilder()
      .setName('setgender')
      .setDescription('Set your gender')
      .addStringOption(o => o.setName('gender').setDescription('Your gender').setRequired(true).addChoices(
        { name: 'Male', value: 'male' },
        { name: 'Female', value: 'female' }
      )),
    new SlashCommandBuilder()
      .setName('impregnate')
      .setDescription('Attempt to impregnate a female member')
      .addUserOption(o => o.setName('user').setDescription('Female member').setRequired(true)),
    new SlashCommandBuilder()
      .setName('checkbirth')
      .setDescription('Check your pregnancy status'),
    new SlashCommandBuilder()
      .setName('profile')
      .setDescription('View your profile')
      .addUserOption(o => o.setName('user').setDescription('View another user\'s profile').setRequired(false))
  ];
  await client.application.commands.set(cmds.map(c => c.toJSON()));
});

client.on('interactionCreate', async i => {
  if (!i.isChatInputCommand() && !i.isButton()) return;

  // Check if channel restriction is enabled
  if (CHANNEL_RESTRICTION_ENABLED && !ALLOWED_CHANNELS.includes(i.channelId)) {
    return i.reply({ 
      content: `❌ This command can only be used in the designated breeding game channel!`, 
      ephemeral: true 
    });
  }

  if (i.commandName === 'setgender') {
    const gender = i.options.getString('gender');
    const profile = await getProfile(i.user.id);
    profile.gender = gender;
    await setProfile(i.user.id, profile);
    await i.reply({ content: `✅ Your gender has been set to **${gender}**.`, ephemeral: true });
  }

  if (i.commandName === 'impregnate') {
    const target = i.options.getUser('user');
    
    if (target.id === i.user.id) {
      return i.reply({ content: '❌ You cannot impregnate yourself!', ephemeral: true });
    }
    
    if (target.bot) {
      return i.reply({ content: '❌ You cannot impregnate a bot!', ephemeral: true });
    }

    const initiatorProfile = await getProfile(i.user.id);
    const targetProfile = await getProfile(target.id);

    if (!initiatorProfile.gender) {
      return i.reply({ content: '❌ You must set your gender first using `/setgender`!', ephemeral: true });
    }

    if (!targetProfile.gender) {
      return i.reply({ content: '❌ Target user must set their gender first!', ephemeral: true });
    }

    if (initiatorProfile.gender !== 'male') {
      return i.reply({ content: '❌ Only male members can use this command!', ephemeral: true });
    }

    if (targetProfile.gender !== 'female') {
      return i.reply({ content: '❌ Target must be a female member!', ephemeral: true });
    }

    if (targetProfile.activePregnancy) {
      return i.reply({ content: '❌ This member is already pregnant!', ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('accept_' + i.id).setLabel('Accept').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('reject_' + i.id).setLabel('Reject').setStyle(ButtonStyle.Danger)
    );

    await i.reply({ 
      content: `<@${target.id}>, <@${i.user.id}> wants to impregnate you! Do you accept?`, 
      components: [row] 
    });
    
    pendingRequests.set(i.id, { targetId: target.id, initiatorId: i.user.id });

    setTimeout(() => {
      pendingRequests.delete(i.id);
    }, 300000);
  }

  if (i.commandName === 'checkbirth') {
    const profile = await getProfile(i.user.id);

    if (!profile.gender) {
      return i.reply({ content: '❌ You must set your gender first using `/setgender`!', ephemeral: true });
    }

    if (profile.gender !== 'female') {
      return i.reply({ content: '❌ Only female members can get pregnant!', ephemeral: true });
    }

    if (!profile.activePregnancy) {
      return i.reply({ content: '❌ You are not pregnant!', ephemeral: true });
    }

    const now = Date.now();
    const dueDate = profile.activePregnancy.dueTimestamp;
    const daysRemaining = Math.ceil((dueDate - now) / 86400000);

    if (daysRemaining > 0) {
      await i.reply({ 
        content: `🤰 You are pregnant! **${daysRemaining} day(s)** remaining until birth.\nFather: <@${profile.activePregnancy.fatherId}>` 
      });
    } else {
      const fatherId = profile.activePregnancy.fatherId;
      profile.babies.push({
        birthTimestamp: now,
        fatherId: fatherId
      });
      profile.totalBabies = profile.babies.length;
      profile.activePregnancy = null;
      await setProfile(i.user.id, profile);

      await i.reply({ 
        content: `🎉 **Congratulations!** You gave birth to a baby!\n👶 Total babies: **${profile.totalBabies}**\n👨 Father: <@${fatherId}>` 
      });
    }
  }

  if (i.commandName === 'profile') {
    const targetUser = i.options.getUser('user') || i.user;
    const profile = await getProfile(targetUser.id);

    if (!profile.gender) {
      await i.reply({ 
        content: `${targetUser.id === i.user.id ? 'You haven\'t' : 'This user hasn\'t'} set a gender yet!`, 
        ephemeral: true 
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Profile`)
      .setColor(profile.gender === 'male' ? 0x3498db : 0xe91e63)
      .addFields(
        { name: '⚧️ Gender', value: profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1), inline: true },
        { name: '👶 Total Babies', value: String(profile.totalBabies), inline: true }
      );

    if (profile.gender === 'female' && profile.activePregnancy) {
      const daysRemaining = Math.ceil((profile.activePregnancy.dueTimestamp - Date.now()) / 86400000);
      embed.addFields({
        name: '🤰 Pregnancy Status',
        value: `Pregnant (${daysRemaining > 0 ? daysRemaining + ' days remaining' : 'Ready to give birth!'})\nFather: <@${profile.activePregnancy.fatherId}>`
      });
    } else if (profile.gender === 'female') {
      embed.addFields({ name: '🤰 Pregnancy Status', value: 'Not pregnant' });
    }

    if (profile.babies.length > 0) {
      const recentBabies = profile.babies.slice(-3).reverse();
      const babyList = recentBabies.map((baby, idx) => {
        const date = new Date(baby.birthTimestamp).toLocaleDateString();
        return `${idx + 1}. Born: ${date} - Father: <@${baby.fatherId}>`;
      }).join('\n');
      
      embed.addFields({ 
        name: `👶 Recent Babies (Last ${Math.min(3, profile.babies.length)})`, 
        value: babyList 
      });
    }

    await i.reply({ embeds: [embed] });
  }

  if (i.isButton()) {
    const [action, id] = i.customId.split('_');
    const request = pendingRequests.get(id);

    if (!request) {
      return i.reply({ content: '❌ This request has expired!', ephemeral: true });
    }

    if (i.user.id !== request.targetId) {
      return i.reply({ content: '❌ This request is not for you!', ephemeral: true });
    }

    if (action === 'accept') {
      const targetProfile = await getProfile(request.targetId);
      const initiatorProfile = await getProfile(request.initiatorId);

      if (!targetProfile.gender || targetProfile.gender !== 'female') {
        return i.update({ content: '❌ Target user must be female!', components: [] });
      }

      if (!initiatorProfile.gender || initiatorProfile.gender !== 'male') {
        return i.update({ content: '❌ Initiator must be male!', components: [] });
      }

      if (targetProfile.activePregnancy) {
        pendingRequests.delete(id);
        return i.update({ content: '❌ You are already pregnant!', components: [] });
      }

      const roll = Math.floor(Math.random() * 100) + 1;
      
      if (roll > 50) {
        const now = Date.now();
        targetProfile.activePregnancy = {
          fatherId: request.initiatorId,
          startTimestamp: now,
          dueTimestamp: now + 604800000,
          conceptionRoll: roll
        };
        await setProfile(request.targetId, targetProfile);

        await i.update({ 
          content: `✅ **Conception successful!** 🎲 Roll: ${roll}/100\n<@${request.targetId}> is now pregnant! 🤰\n👨 Father: <@${request.initiatorId}>\n⏰ Due in 7 days. Use \`/checkbirth\` to check status.`, 
          components: [] 
        });
      } else {
        await i.update({ 
          content: `❌ **Conception failed!** 🎲 Roll: ${roll}/100 (needed >50)\nBetter luck next time!`, 
          components: [] 
        });
      }
    } else {
      await i.update({ content: '❌ Request rejected.', components: [] });
    }

    pendingRequests.delete(id);
  }
});

client.login(process.env.TOKEN);
