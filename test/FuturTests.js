      // TODO QUAND ALGO COMBAT PRET
      it('REVERT: fight() not enough stamina', async function () {
        let eventInvestor2 = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor2 = eventInvestor2.logs[1].args[0].toString()
        let tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)

        let tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        // while (tokenDetailsInvestor2[4] > 0) {
        //   await ue.fight(tokenIdOwner, tokenIdInvestor2, {
        //     from: owner,
        //   })
        //   tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)
        // }
        // let tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        // while (tokenDetailsInvestor[4] > 0) {
        //   if (tokenDetailsOwner[5] < 10) {
        //     break
        //   }
        //   await ue.fight(tokenIdOwner, tokenIdInvestor, {
        //     from: owner,
        //   })
        //   tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        //   tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        // }

        // TEMPORAIRE
        let eventInvestor3 = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor3 = eventInvestor3.logs[1].args[0].toString()

        while (tokenDetailsInvestor[4] > 0) {
          await ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          })
        }

        while (tokenDetailsInvestor3[4] > 0) {
          await ue.fight(tokenIdInvestor2, tokenIdInvestor3, {
            from: investor,
          })
        }
        // TEMPORAIRE
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor2, {
            from: owner,
          }),
          'Not enough stamina',
        )
      })

