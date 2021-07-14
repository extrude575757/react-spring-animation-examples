import { Globals } from 'react-spring'
import { useReduceMotion } from 'react-reduce-motion';

const MyApp = () => {
  const prefersReducedMotion = useReduceMotion()
  React.useEffect(() => {
    Globals.assign({
      skipAnimation: prefersReducedMotion,
    })
  }, [prefersReducedMotion])
  return ...
}
Reduce the animation intensity using a heuristic of your choosing:
import { useReduceMotion } from 'react-reduce-motion';

function ParallaxAnimatedButton({ rotation = 10, scale = 1.2 }) {
  const buttonRef = React.useRef();
  const reduceMotion = useReduceMotion();
  const defaultTransform = [0, 0, 1]
  // This is where we choose the animation intensity depending on user preference.
  const actualRotation = reduceMotion ? rotation / 3 : rotation;
  const actualScale = reduceMotion ? 1.01 : scale;
  const [props, set] = useSpring(() => ({
    xys: defaultTransform,
    config: { mass: 7, tension: 500, friction: 40 }
  }));
  return (
    <animated.button
      ref={buttonRef}
      className="springy-button"
      onMouseMove={({ clientX, clientY }) =>
        set({ xys: calc(actualRotation, actualScale, clientX, clientY, buttonRef.current) })
      }
      onMouseLeave={() => set({ xys: defaultTransform })}
      style={{
        transform: props.xys.to(transform),
      }}
    >
      Hover over me!
    </animated.button>
  );
}