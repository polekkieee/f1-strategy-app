import type { ReactNode } from "react";
import { Modal, type ModalProps } from "react-native";

export const LANDSCAPE_MODAL_ORIENTATIONS: NonNullable<
  ModalProps["supportedOrientations"]
> = ["landscape", "landscape-left", "landscape-right"];

export interface LandscapeModalProps extends ModalProps {
  children?: ReactNode;
}

/**
 * Landscape-enforcing modal wrapper for the HUD companion client (ADR-0004).
 *
 * In React Native iOS, `<Modal>` defaults to portrait-only. When the app is
 * locked to landscape orientation, opening a default modal triggers a native crash
 * due to an empty orientation intersection. This component guarantees supported
 * landscape orientations by default.
 */
export function LandscapeModal({
  supportedOrientations = LANDSCAPE_MODAL_ORIENTATIONS,
  transparent = true,
  animationType = "slide",
  children,
  ...props
}: LandscapeModalProps): ReactNode {
  return (
    <Modal
      animationType={animationType}
      transparent={transparent}
      supportedOrientations={supportedOrientations}
      {...props}
    >
      {children}
    </Modal>
  );
}
