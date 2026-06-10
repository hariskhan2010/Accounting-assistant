import { FadeInView } from "./FadeInView";

export function StaggerList({ items, renderItem, baseDelay = 60, direction = "up", containerStyle }) {
  return (
    <>
      {items.map((item, index) => (
        <FadeInView key={item.id || index} delay={baseDelay * (index + 1)} direction={direction}>
          {renderItem(item, index)}
        </FadeInView>
      ))}
    </>
  );
}
