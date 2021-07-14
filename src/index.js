import { render } from 'react-dom'
import React, { useState } from 'react'
import { useSprings, animated, interpolate } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import './styles.css'


/* had a problem with  
const Component = () => {
  const { x } = useSpring({ from: { x: 0 }, x: 1 });

  return (
    <Text
      style={{
        opacity: x.interpolate({ range: [0, 1], output: [0, 1] }),
        transform: x
          .interpolate({
            range: [0, 0.2, 0.5, 1],
            output: [1, 0.7, 1.5, 1],
          })
          .interpolate((x: number) => `scale(${x}) rotate(4deg)`),
      }}
    >
     My text
    </Text>
  );
};
might work for react v18  
I fixed it using

        opacity: x.to({ range: [0, 1], output: [0, 1] }) as any,
Is there a better way than using the following with v9?

        transform: x
          .to({
            range: [0, 0.2, 0.5, 1],
            output: [1, 0.7, 1.5, 1],
          })
          .to((x: number) => `scale(${x}) rotate(4deg)`),

*/

const cards = [

  'https://lh5.googleusercontent.com/IgJ4s85Toq6hp_NZ-4Y6aM2i7W7cpXIRNKRlG_0dMjHE6rIybnLDKRhUdSKk-ONC7FMcuBL3XIlz47fMwpQ5sTy-5iH_vjp_JDLjqoHcfrfH9XKOUqQ2DKosvavNkoeYM6-fkvjY',
  'https://upload.wikimedia.org/wikipedia/en/f/f5/RWS_Tarot_08_Strength.jpg',
  'https://upload.wikimedia.org/wikipedia/en/5/53/RWS_Tarot_16_Tower.jpg',  
  'https://upload.wikimedia.org/wikipedia/en/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/690px-RWS_Tarot_02_High_Priestess.jpg',
  'https://upload.wikimedia.org/wikipedia/en/d/de/RWS_Tarot_01_Magician.jpg',
  'https://lh5.googleusercontent.com/i_FrSfKJLVO4qVo8-qeY6jFgYCClOmXnuyl-HkvDqkjaNB6-IzHY2I5JYbDCpadGtD8-82dzmpX_zgZxV82BJQdWWM_OmbxLDMW63zUP68YjtEBOEJ9AdmrFvmyAmHOVNt4hqCx9',
  'https://lh6.googleusercontent.com/L3k0H3yqgAUWnkr4ybvSpxN7XSM-iSEVRR9w2zDXR3SAG38B20BU98y4ztkeNNmG6y_wuqlM_tSh6gcomN9dCxbOIRr_Iut5T_mslMq55d59sTzXLy3X8dW2jMUUmoyO20y6cfv7',
  'https://lh6.googleusercontent.com/6C9w4vKoNI15IC8VqOElqn5sKBcUD6Nrk_It3faYT5KghMBUPHyOY8MtHJGCpMPsAkjDNqHCjVSipaoJNLlB6AlnAJU8o78LHs_toX2NZ2bFHrVjH62antL-oSqBfCF8H1L8zzxr',
  'https://lh3.googleusercontent.com/keep-bbsk/AGk0z-MUSBimQI7HeFzkV5iEMsUlrGG7nzUV0WYKo00SdxIqfslYwO0MtmtNop2CNKvTIzeGQnBSTz7muxnpsB3N5BFrAfRcpfYlaqxnAQYg',
]

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 })
const from = (i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

function Deck() {
  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out
  const [props, set] = useSprings(cards.length, (i) => ({ ...to(i), from: from(i) })) // const { x } = useSpring({ from: { x: 0 }, x: 1, config: { duration: 1000 } })   // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useGesture(({ args: [index], down, delta: [xDelta], distance, direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2 // If you flick hard enough it should trigger the card to fly out
    const dir = xDir < 0 ? -1 : 1 // Direction should either point left or right
    if (!down && trigger) gone.add(index) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
    set((i) => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
      const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0) // How much the card tilts, flicking it harder makes it rotate faster
      const scale = down ? 1.1 : 1 // Active cards lift up a bit
      return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } }
    })
    if (!down && gone.size === cards.length) setTimeout(() => gone.clear() || set((i) => to(i)), 600)
  })
  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return props.map(({ x, y, rot, scale }, i) => (
    <animated.div key={i} style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}>
      {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
      <animated.div
        {...bind(i)}
        style={{ transform: interpolate([rot, scale], trans), backgroundImage: `url(${cards[i]})` }}
      />
    </animated.div>
  ))
}

render(  <React.StrictMode>
  <Deck />
</React.StrictMode>, document.getElementById('root'))
